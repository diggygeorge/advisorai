import { NextRequest, NextResponse } from 'next/server';

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

// O*NET API configuration
const ONET_BASE_URL = 'https://services.onetcenter.org/reference/mnm/career/outlook';
const ONET_API_KEY = process.env.ONET_API_KEY; // You'll need to get this from O*NET

// Cache for O*NET data to avoid repeated API calls
const careerCache = new Map<string, ONetOccupation>();

async function searchONetAPI(query: string): Promise<ONetOccupation[]> {
  if (!ONET_API_KEY) {
    console.log("O*NET API key not configured, using fallback data");
    return [];
  }

  try {
    // Search for occupations by title
    const searchUrl = `${ONET_BASE_URL}/occupations?title=${encodeURIComponent(query)}&api_key=${ONET_API_KEY}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'CareerAdvisor/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`O*NET API error: ${response.status}`);
    }

    const searchData = await response.json();
    
    if (!searchData.occupations || searchData.occupations.length === 0) {
      return [];
    }

    // Get detailed information for each occupation
    const detailedOccupations: ONetOccupation[] = [];
    
    for (const occupation of searchData.occupations.slice(0, 5)) { // Limit to top 5
      try {
        const detailUrl = `${ONET_BASE_URL}/occupations/${occupation.code}?api_key=${ONET_API_KEY}`;
        const detailResponse = await fetch(detailUrl);
        
        if (detailResponse.ok) {
          const detailData = await detailResponse.json();
          detailedOccupations.push(transformONetData(detailData));
        }
      } catch (error) {
        console.error(`Error fetching details for ${occupation.code}:`, error);
      }
    }

    return detailedOccupations;
  } catch (error) {
    console.error('Error searching O*NET API:', error);
    return [];
  }
}

function transformONetData(data: any): ONetOccupation {
  return {
    code: data.code || '',
    title: data.title || '',
    description: data.description || '',
    skills: (data.skills || []).map((skill: any) => ({
      name: skill.name || '',
      importance: skill.importance || 0,
      level: skill.level || 0
    })),
    knowledge: (data.knowledge || []).map((knowledge: any) => ({
      name: knowledge.name || '',
      importance: knowledge.importance || 0,
      level: knowledge.level || 0
    })),
    abilities: (data.abilities || []).map((ability: any) => ({
      name: ability.name || '',
      importance: ability.importance || 0,
      level: ability.level || 0
    })),
    work_activities: (data.work_activities || []).map((activity: any) => ({
      name: activity.name || '',
      importance: activity.importance || 0,
      level: activity.level || 0
    })),
    education_required: data.education_required || 'Not specified',
    median_salary: data.median_salary || undefined,
    job_outlook: data.job_outlook || undefined
  };
}

// Fallback data when O*NET API is not available
const fallbackCareers: ONetOccupation[] = [
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
  }
];

async function findClosestCareer(query: string): Promise<ONetOccupation | null> {
  try {
    // Check cache first
    const cacheKey = query.toLowerCase();
    if (careerCache.has(cacheKey)) {
      return careerCache.get(cacheKey)!;
    }

    // Try O*NET API first
    const onetCareers = await searchONetAPI(query);
    
    if (onetCareers.length > 0) {
      const bestMatch = onetCareers[0];
      careerCache.set(cacheKey, bestMatch);
      return bestMatch;
    }

    // Fallback to local data
    const matchingCareers = fallbackCareers.filter(career => 
      career.title.toLowerCase().includes(query.toLowerCase()) ||
      career.description.toLowerCase().includes(query.toLowerCase()) ||
      career.skills.some(skill => skill.name.toLowerCase().includes(query.toLowerCase()))
    );

    if (matchingCareers.length > 0) {
      const bestMatch = matchingCareers[0];
      careerCache.set(cacheKey, bestMatch);
      return bestMatch;
    }

    return null;
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

    return NextResponse.json({ 
      career,
      query: query.trim(),
      source: ONET_API_KEY ? 'O*NET API' : 'Fallback Data'
    });

  } catch (error) {
    console.error("Error in O*NET career API:", error);
    return NextResponse.json(
      { error: "Internal server error", career: null },
      { status: 500 }
    );
  }
}
