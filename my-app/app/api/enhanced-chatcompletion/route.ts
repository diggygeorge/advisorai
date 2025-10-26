import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

interface ONetOccupation {
  code: string;
  title: string;
  description: string;
  skills: {
    name: string;
    importance: number;
    level: number;
  }[];
  knowledge: {
    name: string;
    importance: number;
    level: number;
  }[];
  abilities: {
    name: string;
    importance: number;
    level: number;
  }[];
  work_activities: {
    name: string;
    importance: number;
    level: number;
  }[];
  education_required: string;
  median_salary?: number;
  job_outlook?: string;
}

interface CourseRecommendation {
  courseCode: string;
  courseName: string;
  hubUnits: string[];
  reason: string;
  skills: string;
  careerRelevance: string;
  prerequisites: string;
  group: string;
  skillMatch: string[];
  confidence: number;
}

// Load majors + requirements JSON
const majorsFile = path.join(process.cwd(), "app/data/bu_majors_with_requirements.json");
let majorsData: any = null;

try {
  if (fs.existsSync(majorsFile)) {
    majorsData = JSON.parse(fs.readFileSync(majorsFile, "utf8"));
  }
} catch (error) {
  console.error("Error loading majors data:", error);
}

// OpenAI client (optional - only create if API key is available)
let client: any = null;
if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// Supabase client (optional - only create if env vars are available)
let supabase: any = null;
if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

async function getCareerData(query: string): Promise<ONetOccupation | null> {
  try {
    // Try BLS OOH API first (most comprehensive and accessible)
    const blsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/api/bls-ooh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (blsResponse.ok) {
      const blsData = await blsResponse.json();
      if (blsData.career) {
        console.log(`✅ Found career via BLS OOH: ${blsData.career.title} (${blsData.source})`);
        // Convert BLS format to ONet format
        return {
          code: blsData.career.code,
          title: blsData.career.title,
          description: blsData.career.description,
          skills: blsData.career.skills.map((skill: string) => ({ name: skill, importance: 4, level: 3.5 })),
          knowledge: [
            { name: "Computers and Electronics", importance: 4, level: 3.5 },
            { name: "Mathematics", importance: 3, level: 3.0 },
            { name: "English Language", importance: 3, level: 3.0 }
          ],
          abilities: [
            { name: "Critical Thinking", importance: 4, level: 3.5 },
            { name: "Problem Solving", importance: 4, level: 3.5 },
            { name: "Communication", importance: 3, level: 3.0 }
          ],
          work_activities: [
            { name: "Analyzing Data or Information", importance: 4, level: 3.5 },
            { name: "Making Decisions and Solving Problems", importance: 4, level: 3.5 }
          ],
          education_required: blsData.career.education,
          median_salary: blsData.career.median_salary,
          job_outlook: blsData.career.job_outlook
        };
      }
    }

    // Fallback to OOH API
    const oohResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/api/ooh-career`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (oohResponse.ok) {
      const oohData = await oohResponse.json();
      if (oohData.career) {
        console.log(`✅ Found career via OOH: ${oohData.career.title}`);
        return oohData.career;
      }
    }

    console.error('Failed to fetch career data from both APIs');
    return null;
  } catch (error) {
    console.error('Error fetching career data:', error);
    return null;
  }
}

async function searchCoursesWithVectorSearch(skills: string[], careerTitle: string): Promise<any[]> {
  if (!supabase || !client) {
    console.log("Supabase or OpenAI not configured, using basic search");
    return [];
  }

  try {
    // Create a comprehensive query for vector search
    const queryText = `Boston University courses that teach: ${skills.join(', ')} for ${careerTitle} career. Focus on programming, computer science, mathematics, and technical skills.`;

    // Generate embedding for the query
    const embeddingResponse = await client.embeddings.create({
      model: "text-embedding-3-large",
      input: queryText,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Search Supabase for similar courses
    const { data: matches, error } = await supabase.rpc("match_courses", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 15,
    });

    if (error) {
      console.error("Error matching courses:", error);
      return [];
    }

    return matches || [];
  } catch (error) {
    console.error("Error in vector search:", error);
    return [];
  }
}

function calculateSkillMatch(courseSkills: string, careerSkills: string[]): { matchedSkills: string[], confidence: number } {
  const courseSkillsLower = courseSkills.toLowerCase();
  const matchedSkills: string[] = [];
  
  careerSkills.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (courseSkillsLower.includes(skillLower) || 
        skillLower.includes('programming') && courseSkillsLower.includes('code') ||
        skillLower.includes('problem') && courseSkillsLower.includes('analysis') ||
        skillLower.includes('critical') && courseSkillsLower.includes('thinking')) {
      matchedSkills.push(skill);
    }
  });

  const confidence = matchedSkills.length / careerSkills.length;
  return { matchedSkills, confidence };
}

async function generateAIRecommendations(
  career: ONetOccupation, 
  vectorMatches: any[], 
  basicCourses: any[]
): Promise<CourseRecommendation[]> {
  if (!client) {
    console.log("OpenAI not configured, using basic recommendations");
    return basicCourses.slice(0, 8).map((course: any) => ({
      courseCode: course.code || course.courseCode || 'N/A',
      courseName: course.title || course.courseName || 'Course',
      hubUnits: course.hubUnits || [],
      reason: `Core requirement for ${career.title} - ${course.skills || course.careerRelevance || 'Essential course'}`,
      skills: course.skills || 'See course description',
      careerRelevance: course.careerRelevance || 'Essential for this career',
      prerequisites: course.prerequisites || 'See course catalog',
      group: course.group || 'Core',
      skillMatch: [],
      confidence: 0.5
    }));
  }

  try {
    // Prepare skills data for AI
    const topSkills = career.skills
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10)
      .map(s => s.name);

    const topKnowledge = career.knowledge
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 8)
      .map(k => k.name);

    const systemPrompt = `
You are an expert academic advisor specializing in career-to-course mapping for Boston University students.

Career Information:
- Title: ${career.title}
- Description: ${career.description}
- Required Education: ${career.education_required}
- Median Salary: ${career.median_salary ? `$${career.median_salary.toLocaleString()}` : 'Not specified'}
- Job Outlook: ${career.job_outlook || 'Not specified'}

Key Skills Required (by importance):
${topSkills.map((skill, i) => `${i + 1}. ${skill}`).join('\n')}

Key Knowledge Areas Required (by importance):
${topKnowledge.map((knowledge, i) => `${i + 1}. ${knowledge}`).join('\n')}

Your task:
1. Analyze the provided courses (both from vector search and basic course data)
2. Match courses to the career requirements based on skills, knowledge, and career relevance
3. Rank courses by how well they prepare students for this specific career
4. Provide detailed reasoning for each recommendation
5. Calculate confidence scores (0-1) based on skill alignment

Return results in this JSON format:
[
  {
    "courseCode": "CAS CS 111",
    "courseName": "Introduction to Computer Science 1",
    "hubUnits": ["QR1", "CRT"],
    "reason": "Essential foundation for software development. Teaches programming fundamentals that directly align with the top required skill of Programming.",
    "skills": "Programming fundamentals, computational thinking, problem decomposition",
    "careerRelevance": "Directly applicable to software development roles. Required prerequisite for advanced CS courses.",
    "prerequisites": "None",
    "group": "Core",
    "skillMatch": ["Programming", "Problem Solving"],
    "confidence": 0.95
  }
]

Focus on:
- Technical skills alignment
- Career pathway preparation
- Prerequisite chains
- Practical applicability
- Skill development progression
`;

    const userPrompt = `
Here are the available courses:

Vector Search Results (AI-matched courses):
${JSON.stringify(vectorMatches.slice(0, 10), null, 2)}

Basic Course Data (from university requirements):
${JSON.stringify(basicCourses.slice(0, 15), null, 2)}

Please provide 8-12 well-reasoned course recommendations that best prepare a student for a career as a ${career.title}.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let recommendations: CourseRecommendation[];
    try {
      recommendations = JSON.parse(completion.choices[0].message.content || "[]");
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      // Fallback to basic recommendations
      recommendations = basicCourses.slice(0, 8).map((course: any) => {
        const { matchedSkills, confidence } = calculateSkillMatch(
          course.skills || course.careerRelevance || '', 
          topSkills
        );
        
        return {
          courseCode: course.code || course.courseCode || 'N/A',
          courseName: course.title || course.courseName || 'Course',
          hubUnits: course.hubUnits || [],
          reason: `Core requirement for ${career.title} - ${course.skills || course.careerRelevance || 'Essential course'}`,
          skills: course.skills || 'See course description',
          careerRelevance: course.careerRelevance || 'Essential for this career',
          prerequisites: course.prerequisites || 'See course catalog',
          group: course.group || 'Core',
          skillMatch: matchedSkills,
          confidence: confidence
        };
      });
    }

    return recommendations;

  } catch (error) {
    console.error("Error generating AI recommendations:", error);
    // Fallback to basic recommendations
    return basicCourses.slice(0, 8).map((course: any) => ({
      courseCode: course.code || course.courseCode || 'N/A',
      courseName: course.title || course.courseName || 'Course',
      hubUnits: course.hubUnits || [],
      reason: `Core requirement for ${career.title} - ${course.skills || course.careerRelevance || 'Essential course'}`,
      skills: course.skills || 'See course description',
      careerRelevance: course.careerRelevance || 'Essential for this career',
      prerequisites: course.prerequisites || 'See course catalog',
      group: course.group || 'Core',
      skillMatch: [],
      confidence: 0.5
    }));
  }
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({ 
        error: "Invalid JSON in request body",
        recommendations: []
      }, { status: 400 });
    }

    // Validate request body
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json({ 
        error: "Request body must be a valid JSON object",
        recommendations: []
      }, { status: 400 });
    }

    const { career, missingUnits = [] } = requestBody;

    if (!career || typeof career !== 'string') {
      return NextResponse.json({ 
        error: "Career is required and must be a string",
        recommendations: []
      }, { status: 400 });
    }

    if (!majorsData) {
      return NextResponse.json({ error: "Majors data not available" }, { status: 500 });
    }

    console.log(`🔍 Processing career query: "${career}"`);

    // Step 1: Get career data from OOH
    const careerData = await getCareerData(career);
    
    if (!careerData) {
      console.log("No career data found, using basic recommendations");
      // Fallback to basic recommendations
      const basicRecommendations = [
        {
          courseCode: 'N/A',
          courseName: 'No specific courses found',
          reason: `No detailed career information available for "${career}". Please check the course catalog.`,
          skills: 'See course catalog',
          careerRelevance: 'See course catalog',
          prerequisites: 'See course catalog',
          group: 'General',
          skillMatch: [],
          confidence: 0
        }
      ];
      return NextResponse.json({ recommendations: basicRecommendations });
    }

    console.log(`✅ Found career: ${careerData.title}`);

    // Step 2: Extract skills for vector search
    const topSkills = careerData.skills
      .sort((a, b) => b.importance - a.importance)
      .slice(0, 10)
      .map(s => s.name);

    console.log(`🎯 Key skills: ${topSkills.join(', ')}`);

    // Step 3: Search for courses using vector embeddings
    const vectorMatches = await searchCoursesWithVectorSearch(topSkills, careerData.title);
    console.log(`📚 Found ${vectorMatches.length} courses from vector search`);

    // Step 4: Get basic course data from JSON
    const basicCourses = [];
    if (majorsData.colleges) {
      majorsData.colleges.forEach((college: any) => {
        if (college.majors) {
          college.majors.forEach((major: any) => {
            if (typeof major === 'object' && major.courses) {
              basicCourses.push(...major.courses);
            }
          });
        }
      });
    }

    console.log(`📖 Found ${basicCourses.length} courses from JSON data`);

    // Step 5: Generate AI-powered recommendations
    const recommendations = await generateAIRecommendations(careerData, vectorMatches, basicCourses);

    console.log(`🎉 Generated ${recommendations.length} recommendations`);

    // Generate academic schedule
    let academicPlan = null;
    try {
      const scheduleResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'}/api/academic-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          career: careerData.title,
          recommendedCourses: recommendations
        }),
      });

      if (scheduleResponse.ok) {
        const scheduleData = await scheduleResponse.json();
        academicPlan = scheduleData.plan;
        console.log(`📅 Generated academic plan for ${careerData.title}`);
      }
    } catch (error) {
      console.error('Error generating academic schedule:', error);
    }

    return NextResponse.json({ 
      recommendations,
      career: careerData,
      academicPlan,
      searchStats: {
        vectorMatches: vectorMatches.length,
        basicCourses: basicCourses.length,
        totalRecommendations: recommendations.length
      }
    });

  } catch (error) {
    console.error("Error in enhanced chatcompletion API:", error);
    return NextResponse.json(
      { error: "Internal server error", recommendations: [] },
      { status: 500 }
    );
  }
}
