import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";

// O*NET API integration for career data
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

// OpenAI client
let client: any = null;
if (process.env.OPENAI_API_KEY) {
  client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// O*NET API base URL
const ONET_BASE_URL = 'https://services.onetcenter.org/reference/mnm/career/outlook';

// Cache for O*NET data to avoid repeated API calls
const careerCache = new Map<string, ONetOccupation>();

async function searchONetCareers(query: string): Promise<ONetOccupation[]> {
  try {
    // For now, we'll use a mock dataset since O*NET API requires registration
    // In production, you would make actual API calls to O*NET
    
    const mockCareers: ONetOccupation[] = [
      {
        code: "15-1132",
        title: "Software Developers, Applications",
        description: "Develop, create, and modify general computer applications software or specialized utility programs. Analyze user needs and develop software solutions.",
        skills: [
          { name: "Programming", importance: 5, level: 4.5 },
          { name: "Problem Solving", importance: 5, level: 4.3 },
          { name: "Critical Thinking", importance: 4, level: 4.1 },
          { name: "Complex Problem Solving", importance: 4, level: 4.0 },
          { name: "Systems Analysis", importance: 4, level: 3.8 },
          { name: "Active Learning", importance: 4, level: 3.7 },
          { name: "Judgment and Decision Making", importance: 4, level: 3.6 },
          { name: "Operations Analysis", importance: 3, level: 3.5 },
          { name: "Technology Design", importance: 3, level: 3.4 },
          { name: "Quality Control Analysis", importance: 3, level: 3.2 }
        ],
        knowledge: [
          { name: "Computers and Electronics", importance: 5, level: 4.8 },
          { name: "Mathematics", importance: 4, level: 4.2 },
          { name: "Engineering and Technology", importance: 4, level: 4.0 },
          { name: "English Language", importance: 3, level: 3.8 },
          { name: "Design", importance: 3, level: 3.5 },
          { name: "Physics", importance: 2, level: 3.2 },
          { name: "Administration and Management", importance: 2, level: 3.0 }
        ],
        abilities: [
          { name: "Deductive Reasoning", importance: 5, level: 4.5 },
          { name: "Inductive Reasoning", importance: 5, level: 4.3 },
          { name: "Problem Sensitivity", importance: 4, level: 4.2 },
          { name: "Information Ordering", importance: 4, level: 4.0 },
          { name: "Category Flexibility", importance: 4, level: 3.9 },
          { name: "Mathematical Reasoning", importance: 4, level: 3.8 },
          { name: "Number Facility", importance: 3, level: 3.6 },
          { name: "Spatial Orientation", importance: 2, level: 3.2 }
        ],
        work_activities: [
          { name: "Analyzing Data or Information", importance: 5, level: 4.6 },
          { name: "Making Decisions and Solving Problems", importance: 5, level: 4.5 },
          { name: "Thinking Creatively", importance: 4, level: 4.3 },
          { name: "Updating and Using Relevant Knowledge", importance: 4, level: 4.2 },
          { name: "Processing Information", importance: 4, level: 4.1 },
          { name: "Communicating with Supervisors, Peers, or Subordinates", importance: 3, level: 3.8 },
          { name: "Organizing, Planning, and Prioritizing Work", importance: 3, level: 3.7 }
        ],
        education_required: "Bachelor's degree in Computer Science, Software Engineering, or related field",
        median_salary: 110140,
        job_outlook: "22% growth from 2020 to 2030"
      },
      {
        code: "15-1131",
        title: "Computer Programmers",
        description: "Create, modify, and test the code and scripts that allow computer applications to run. Work from specifications drawn up by software and web developers.",
        skills: [
          { name: "Programming", importance: 5, level: 4.7 },
          { name: "Critical Thinking", importance: 4, level: 4.2 },
          { name: "Complex Problem Solving", importance: 4, level: 4.1 },
          { name: "Active Learning", importance: 4, level: 3.9 },
          { name: "Judgment and Decision Making", importance: 4, level: 3.8 },
          { name: "Operations Analysis", importance: 3, level: 3.6 },
          { name: "Systems Analysis", importance: 3, level: 3.5 },
          { name: "Quality Control Analysis", importance: 3, level: 3.4 },
          { name: "Time Management", importance: 3, level: 3.3 },
          { name: "Monitoring", importance: 3, level: 3.2 }
        ],
        knowledge: [
          { name: "Computers and Electronics", importance: 5, level: 4.9 },
          { name: "Mathematics", importance: 4, level: 4.1 },
          { name: "Engineering and Technology", importance: 4, level: 3.9 },
          { name: "English Language", importance: 3, level: 3.7 },
          { name: "Design", importance: 3, level: 3.4 },
          { name: "Physics", importance: 2, level: 3.1 }
        ],
        abilities: [
          { name: "Deductive Reasoning", importance: 5, level: 4.6 },
          { name: "Inductive Reasoning", importance: 5, level: 4.4 },
          { name: "Problem Sensitivity", importance: 4, level: 4.3 },
          { name: "Information Ordering", importance: 4, level: 4.1 },
          { name: "Mathematical Reasoning", importance: 4, level: 3.9 },
          { name: "Category Flexibility", importance: 4, level: 3.8 },
          { name: "Number Facility", importance: 3, level: 3.7 },
          { name: "Spatial Orientation", importance: 2, level: 3.3 }
        ],
        work_activities: [
          { name: "Analyzing Data or Information", importance: 5, level: 4.7 },
          { name: "Making Decisions and Solving Problems", importance: 5, level: 4.6 },
          { name: "Thinking Creatively", importance: 4, level: 4.4 },
          { name: "Updating and Using Relevant Knowledge", importance: 4, level: 4.3 },
          { name: "Processing Information", importance: 4, level: 4.2 },
          { name: "Communicating with Supervisors, Peers, or Subordinates", importance: 3, level: 3.9 }
        ],
        education_required: "Bachelor's degree in Computer Science or related field",
        median_salary: 89390,
        job_outlook: "-10% decline from 2020 to 2030"
      },
      {
        code: "15-1121",
        title: "Computer Systems Analysts",
        description: "Analyze science, engineering, business, and other data processing problems to implement and improve computer systems.",
        skills: [
          { name: "Critical Thinking", importance: 5, level: 4.4 },
          { name: "Complex Problem Solving", importance: 5, level: 4.3 },
          { name: "Active Learning", importance: 4, level: 4.1 },
          { name: "Judgment and Decision Making", importance: 4, level: 4.0 },
          { name: "Systems Analysis", importance: 4, level: 4.2 },
          { name: "Operations Analysis", importance: 4, level: 3.9 },
          { name: "Programming", importance: 3, level: 3.8 },
          { name: "Quality Control Analysis", importance: 3, level: 3.6 },
          { name: "Time Management", importance: 3, level: 3.5 },
          { name: "Monitoring", importance: 3, level: 3.4 }
        ],
        knowledge: [
          { name: "Computers and Electronics", importance: 5, level: 4.7 },
          { name: "Mathematics", importance: 4, level: 4.0 },
          { name: "Engineering and Technology", importance: 4, level: 3.8 },
          { name: "English Language", importance: 3, level: 3.9 },
          { name: "Administration and Management", importance: 3, level: 3.6 },
          { name: "Design", importance: 3, level: 3.4 },
          { name: "Physics", importance: 2, level: 3.0 }
        ],
        abilities: [
          { name: "Deductive Reasoning", importance: 5, level: 4.5 },
          { name: "Inductive Reasoning", importance: 5, level: 4.3 },
          { name: "Problem Sensitivity", importance: 4, level: 4.2 },
          { name: "Information Ordering", importance: 4, level: 4.1 },
          { name: "Mathematical Reasoning", importance: 4, level: 3.9 },
          { name: "Category Flexibility", importance: 4, level: 3.8 },
          { name: "Number Facility", importance: 3, level: 3.6 },
          { name: "Spatial Orientation", importance: 2, level: 3.2 }
        ],
        work_activities: [
          { name: "Analyzing Data or Information", importance: 5, level: 4.8 },
          { name: "Making Decisions and Solving Problems", importance: 5, level: 4.6 },
          { name: "Thinking Creatively", importance: 4, level: 4.4 },
          { name: "Updating and Using Relevant Knowledge", importance: 4, level: 4.3 },
          { name: "Processing Information", importance: 4, level: 4.2 },
          { name: "Communicating with Supervisors, Peers, or Subordinates", importance: 3, level: 4.0 }
        ],
        education_required: "Bachelor's degree in Computer Science, Information Technology, or related field",
        median_salary: 93730,
        job_outlook: "7% growth from 2020 to 2030"
      },
      {
        code: "15-2051",
        title: "Data Scientists",
        description: "Develop and implement a set of techniques or analytics applications to transform raw data into meaningful information using data-oriented programming languages and visualization software.",
        skills: [
          { name: "Critical Thinking", importance: 5, level: 4.6 },
          { name: "Complex Problem Solving", importance: 5, level: 4.5 },
          { name: "Active Learning", importance: 5, level: 4.4 },
          { name: "Programming", importance: 5, level: 4.3 },
          { name: "Mathematics", importance: 5, level: 4.2 },
          { name: "Statistics", importance: 5, level: 4.1 },
          { name: "Machine Learning", importance: 4, level: 4.0 },
          { name: "Data Analysis", importance: 4, level: 4.2 },
          { name: "Judgment and Decision Making", importance: 4, level: 3.9 },
          { name: "Operations Analysis", importance: 4, level: 3.8 }
        ],
        knowledge: [
          { name: "Mathematics", importance: 5, level: 4.8 },
          { name: "Computers and Electronics", importance: 5, level: 4.7 },
          { name: "Statistics", importance: 5, level: 4.6 },
          { name: "Engineering and Technology", importance: 4, level: 4.2 },
          { name: "English Language", importance: 3, level: 3.8 },
          { name: "Physics", importance: 3, level: 3.5 },
          { name: "Administration and Management", importance: 2, level: 3.2 }
        ],
        abilities: [
          { name: "Mathematical Reasoning", importance: 5, level: 4.7 },
          { name: "Deductive Reasoning", importance: 5, level: 4.6 },
          { name: "Inductive Reasoning", importance: 5, level: 4.5 },
          { name: "Number Facility", importance: 5, level: 4.4 },
          { name: "Problem Sensitivity", importance: 4, level: 4.3 },
          { name: "Information Ordering", importance: 4, level: 4.2 },
          { name: "Category Flexibility", importance: 4, level: 4.1 },
          { name: "Spatial Orientation", importance: 2, level: 3.3 }
        ],
        work_activities: [
          { name: "Analyzing Data or Information", importance: 5, level: 4.9 },
          { name: "Making Decisions and Solving Problems", importance: 5, level: 4.7 },
          { name: "Thinking Creatively", importance: 4, level: 4.5 },
          { name: "Updating and Using Relevant Knowledge", importance: 4, level: 4.4 },
          { name: "Processing Information", importance: 4, level: 4.3 },
          { name: "Communicating with Supervisors, Peers, or Subordinates", importance: 3, level: 4.1 }
        ],
        education_required: "Master's degree in Data Science, Statistics, Computer Science, or related field",
        median_salary: 103500,
        job_outlook: "35% growth from 2020 to 2030"
      },
      {
        code: "15-1134",
        title: "Web Developers",
        description: "Design and create websites. Responsible for the site's technical aspects, such as its performance and capacity, which are measures of a website's speed and how much traffic the site can handle.",
        skills: [
          { name: "Programming", importance: 5, level: 4.5 },
          { name: "Critical Thinking", importance: 4, level: 4.2 },
          { name: "Complex Problem Solving", importance: 4, level: 4.1 },
          { name: "Active Learning", importance: 4, level: 4.0 },
          { name: "Judgment and Decision Making", importance: 4, level: 3.9 },
          { name: "Operations Analysis", importance: 3, level: 3.8 },
          { name: "Quality Control Analysis", importance: 3, level: 3.7 },
          { name: "Time Management", importance: 3, level: 3.6 },
          { name: "Monitoring", importance: 3, level: 3.5 },
          { name: "Systems Analysis", importance: 3, level: 3.4 }
        ],
        knowledge: [
          { name: "Computers and Electronics", importance: 5, level: 4.8 },
          { name: "Design", importance: 4, level: 4.2 },
          { name: "Mathematics", importance: 3, level: 3.8 },
          { name: "English Language", importance: 3, level: 3.7 },
          { name: "Engineering and Technology", importance: 3, level: 3.6 },
          { name: "Administration and Management", importance: 2, level: 3.2 },
          { name: "Physics", importance: 1, level: 2.8 }
        ],
        abilities: [
          { name: "Deductive Reasoning", importance: 4, level: 4.3 },
          { name: "Inductive Reasoning", importance: 4, level: 4.2 },
          { name: "Problem Sensitivity", importance: 4, level: 4.1 },
          { name: "Information Ordering", importance: 4, level: 4.0 },
          { name: "Mathematical Reasoning", importance: 3, level: 3.8 },
          { name: "Category Flexibility", importance: 3, level: 3.7 },
          { name: "Number Facility", importance: 3, level: 3.6 },
          { name: "Spatial Orientation", importance: 2, level: 3.3 }
        ],
        work_activities: [
          { name: "Analyzing Data or Information", importance: 4, level: 4.4 },
          { name: "Making Decisions and Solving Problems", importance: 4, level: 4.3 },
          { name: "Thinking Creatively", importance: 4, level: 4.2 },
          { name: "Updating and Using Relevant Knowledge", importance: 4, level: 4.1 },
          { name: "Processing Information", importance: 4, level: 4.0 },
          { name: "Communicating with Supervisors, Peers, or Subordinates", importance: 3, level: 3.9 }
        ],
        education_required: "Associate's degree in Web Design or related field, or equivalent experience",
        median_salary: 77830,
        job_outlook: "13% growth from 2020 to 2030"
      }
    ];

    // Simple text matching for now - in production, use more sophisticated matching
    const matchingCareers = mockCareers.filter(career => 
      career.title.toLowerCase().includes(query.toLowerCase()) ||
      career.description.toLowerCase().includes(query.toLowerCase()) ||
      career.skills.some(skill => skill.name.toLowerCase().includes(query.toLowerCase()))
    );

    return matchingCareers;
  } catch (error) {
    console.error('Error searching O*NET careers:', error);
    return [];
  }
}

async function findClosestCareer(query: string): Promise<ONetOccupation | null> {
  try {
    const careers = await searchONetCareers(query);
    
    if (careers.length === 0) {
      return null;
    }

    // For now, return the first match
    // In production, you could use more sophisticated matching algorithms
    return careers[0];
  } catch (error) {
    console.error('Error finding closest career:', error);
    return null;
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
        career: null
      }, { status: 400 });
    }

    // Validate request body
    if (!requestBody || typeof requestBody !== 'object') {
      return NextResponse.json({ 
        error: "Request body must be a valid JSON object",
        career: null
      }, { status: 400 });
    }

    const { query } = requestBody;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ 
        error: "Query is required and must be a string",
        career: null
      }, { status: 400 });
    }

    // Find the closest matching career
    const career = await findClosestCareer(query);

    if (!career) {
      return NextResponse.json({ 
        error: `No matching career found for: ${query}`,
        career: null
      }, { status: 404 });
    }

    // Cache the result
    careerCache.set(query.toLowerCase(), career);

    return NextResponse.json({ 
      career,
      query: query.trim()
    });

  } catch (error) {
    console.error("Error in OOH career API:", error);
    return NextResponse.json(
      { error: "Internal server error", career: null },
      { status: 500 }
    );
  }
}
