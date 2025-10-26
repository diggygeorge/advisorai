import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

interface Requirement {
  courseCode: string;
  courseName: string;
  hubUnits?: string[];
  status?: "Missing" | "Completed";
  [key: string]: any;
}

interface MajorEntry {
  college: string;
  major: string;
  programUrl?: string;
  requirements: Requirement[];
  [key: string]: any;
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

    // Find major requirements
    const majorEntry = majorsData.colleges?.find((college: any) =>
      college.majors?.some((major: any) =>
        typeof major === 'string' 
          ? major.toLowerCase().includes(career.toLowerCase())
          : major.name?.toLowerCase().includes(career.toLowerCase())
      )
    );

    if (!majorEntry) {
      return NextResponse.json({ 
        error: `No major requirements found for: ${career}`,
        recommendations: []
      }, { status: 404 });
    }

    // Get the specific major details
    const specificMajor = majorEntry.majors?.find((major: any) =>
      typeof major === 'string' 
        ? major.toLowerCase().includes(career.toLowerCase())
        : major.name?.toLowerCase().includes(career.toLowerCase())
    );

    // If we have detailed course requirements, use them
    let courseRequirements = [];
    if (specificMajor && typeof specificMajor === 'object' && specificMajor.courses) {
      courseRequirements = specificMajor.courses;
    }

    // If neither OpenAI nor Supabase are available, use basic recommendations from JSON data
    if (!client || !supabase) {
      console.log("OpenAI or Supabase not configured, using basic recommendations from JSON data");
      
      if (courseRequirements.length === 0) {
        return NextResponse.json({ 
          recommendations: [{
            courseCode: 'N/A',
            courseName: 'No specific courses found',
            reason: `No detailed course information available for ${career}. Please check the course catalog.`,
            skills: 'See course catalog',
            careerRelevance: 'See course catalog',
            prerequisites: 'See course catalog',
            group: 'General'
          }]
        });
      }
      
      const basicRecommendations = courseRequirements.slice(0, 8).map((course: any) => ({
        courseCode: course.code || course.courseCode || 'N/A',
        courseName: course.title || course.courseName || 'Course',
        hubUnits: course.hubUnits || [],
        reason: `Core requirement for ${career} - ${course.skills || course.careerRelevance || 'Essential course'}`,
        skills: course.skills || 'See course description',
        careerRelevance: course.careerRelevance || 'Essential for this major',
        prerequisites: course.prerequisites || 'See course catalog',
        group: course.group || 'Core'
      }));

      return NextResponse.json({ recommendations: basicRecommendations });
    }

    // Create a query text for embedding search
    const queryText = `Boston University courses suitable for a student majoring in ${career}${missingUnits.length > 0 ? ` that fulfill the following BU Hub units: ${missingUnits.join(", ")}` : ""}.`;

    // Generate an embedding for the query
    const embeddingResponse = await client.embeddings.create({
      model: "text-embedding-3-large",
      input: queryText,
    });
    const queryEmbedding = embeddingResponse.data[0].embedding;

    // Query Supabase for similar embeddings
    const { data: matches, error: supabaseError } = await supabase.rpc("match_courses", {
      query_embedding: queryEmbedding,
      match_threshold: 0.75,
      match_count: 10,
    });

    if (supabaseError) {
      console.error("Error matching courses:", supabaseError);
      // Fallback to basic recommendations if Supabase fails
      const basicRecommendations = courseRequirements.slice(0, 5).map((course: any) => ({
        courseCode: course.code || course.courseCode,
        courseName: course.title || course.courseName,
        hubUnits: course.hubUnits || [],
        reason: `Core requirement for ${career} - ${course.skills || course.careerRelevance || 'Essential course'}`,
        skills: course.skills,
        careerRelevance: course.careerRelevance,
        prerequisites: course.prerequisites,
        group: course.group
      }));

      return NextResponse.json({ recommendations: basicRecommendations });
    }

    // Use OpenAI to reason about the matches
    const systemPrompt = `
You are an academic advisor specializing in Boston University's Hub program.

Student background:
- Career focus: ${career}
- Missing Hub Units: ${missingUnits.join(", ") || "Not specified"}

You have access to program requirements:
${courseRequirements.length > 0 ? JSON.stringify(courseRequirements.slice(0, 10), null, 2) : "Basic major information available"}

Your task:
- Filter and rank courses from Supabase vector search.
- Prefer courses that make sense for a ${career} track.
- Return results in JSON format like:

[
  {
    "courseCode": "CAS CS 320",
    "courseName": "Concepts of Programming Languages",
    "hubUnits": ["CRT", "QR2"],
    "reason": "Relevant to Computer Science and fulfills QR2.",
    "skills": "Programming language concepts",
    "careerRelevance": "Essential for software development",
    "prerequisites": "CAS CS 112",
    "group": "Core"
  }
]
`;

    const userPrompt = `
Here are the course candidates from Supabase:
${JSON.stringify(matches, null, 2)}

Please provide 5-8 well-reasoned course recommendations for a ${career} student.
`;

    const completion = await client.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.7,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    let recommendations;
    try {
      recommendations = JSON.parse(completion.choices[0].message.content || "[]");
    } catch (parseError) {
      // Fallback if JSON parsing fails
      recommendations = [{
        courseCode: "N/A",
        courseName: "AI Recommendation",
        reason: completion.choices[0].message.content || "AI-generated recommendation",
        hubUnits: [],
        skills: "See reason",
        careerRelevance: "See reason",
        prerequisites: "See course catalog",
        group: "Recommended"
      }];
    }

    console.log(recommendations)

    return NextResponse.json({ recommendations });

  } catch (error) {
    console.error("Error in chatcompletion API:", error);
    return NextResponse.json(
      { error: "Internal server error", recommendations: [] },
      { status: 500 }
    );
  }
}
