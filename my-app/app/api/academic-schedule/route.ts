import { NextRequest, NextResponse } from 'next/server';

interface Course {
  code: string;
  name: string;
  credits: number;
  prerequisites: string[];
  semester: 'Fall' | 'Spring' | 'Summer';
  year: number;
  category: string;
  difficulty: string;
}

interface AcademicPlan {
  career: string;
  totalCredits: number;
  years: {
    [key: number]: {
      Fall: Course[];
      Spring: Course[];
      Summer?: Course[];
    };
  };
  prerequisites: { [key: string]: string[] };
  recommendations: string[];
}

function generateAcademicPlan(career: string, recommendedCourses: any[]): AcademicPlan {
  // Define course categories and typical progression
  const courseCategories = {
    'Core': ['Introduction to Computer Science', 'Data Structures', 'Algorithms', 'Software Engineering'],
    'Mathematics': ['Calculus I', 'Calculus II', 'Linear Algebra', 'Statistics', 'Discrete Mathematics'],
    'Science': ['Physics I', 'Physics II', 'Chemistry I', 'Biology I'],
    'General Education': ['English Composition', 'History', 'Literature', 'Philosophy', 'Psychology'],
    'Elective': ['Advanced Programming', 'Machine Learning', 'Database Systems', 'Web Development']
  };

  // Create a structured 4-year plan
  const plan: AcademicPlan = {
    career,
    totalCredits: 128,
    years: {
      1: { Fall: [], Spring: [], Summer: [] },
      2: { Fall: [], Spring: [], Summer: [] },
      3: { Fall: [], Spring: [], Summer: [] },
      4: { Fall: [], Spring: [], Summer: [] }
    },
    prerequisites: {},
    recommendations: []
  };

  // Map recommended courses to academic years
  const courseMapping: { [key: string]: { year: number; semester: 'Fall' | 'Spring'; credits: number; category: 'Core' | 'Mathematics' | 'Science' | 'General Education' | 'Elective'; difficulty: 'Intro' | 'Intermediate' | 'Advanced' } } = {
    // Freshman Year
    'Introduction to Computer Science': { year: 1, semester: 'Fall', credits: 4, category: 'Core' as const, difficulty: 'Intro' as const },
    'Calculus I': { year: 1, semester: 'Fall', credits: 4, category: 'Mathematics' as const, difficulty: 'Intro' as const },
    'English Composition': { year: 1, semester: 'Fall', credits: 3, category: 'General Education' as const, difficulty: 'Intro' as const },
    'Physics I': { year: 1, semester: 'Spring', credits: 4, category: 'Science' as const, difficulty: 'Intro' as const },
    'Data Structures': { year: 1, semester: 'Spring', credits: 4, category: 'Core' as const, difficulty: 'Intermediate' as const },
    'Calculus II': { year: 1, semester: 'Spring', credits: 4, category: 'Mathematics' as const, difficulty: 'Intermediate' as const },

    // Sophomore Year
    'Algorithms': { year: 2, semester: 'Fall', credits: 4, category: 'Core' as const, difficulty: 'Intermediate' as const },
    'Linear Algebra': { year: 2, semester: 'Fall', credits: 3, category: 'Mathematics' as const, difficulty: 'Intermediate' as const },
    'Database Systems': { year: 2, semester: 'Spring', credits: 3, category: 'Elective' as const, difficulty: 'Intermediate' as const },
    'Statistics': { year: 2, semester: 'Spring', credits: 3, category: 'Mathematics' as const, difficulty: 'Intermediate' as const },

    // Junior Year
    'Software Engineering': { year: 3, semester: 'Fall', credits: 4, category: 'Core' as const, difficulty: 'Advanced' as const },
    'Machine Learning': { year: 3, semester: 'Fall', credits: 3, category: 'Elective' as const, difficulty: 'Advanced' as const },
    'Web Development': { year: 3, semester: 'Spring', credits: 3, category: 'Elective' as const, difficulty: 'Intermediate' as const },
    'Advanced Programming': { year: 3, semester: 'Spring', credits: 3, category: 'Elective' as const, difficulty: 'Advanced' as const },

    // Senior Year
    'Capstone Project': { year: 4, semester: 'Fall', credits: 4, category: 'Core' as const, difficulty: 'Advanced' as const },
    'Professional Development': { year: 4, semester: 'Spring', credits: 3, category: 'General Education' as const, difficulty: 'Advanced' as const }
  };

  // Add courses to the plan based on career focus
  recommendedCourses.forEach((course, index) => {
    const courseName = course.courseName || course.title || `Course ${index + 1}`;
    const courseCode = course.courseCode || `CS ${100 + index}`;
    
    // Find matching course in our mapping
    const mappedCourse = Object.entries(courseMapping).find(([name, _]) => 
      courseName.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(courseName.toLowerCase())
    );

    if (mappedCourse && mappedCourse[1]) {
      const [name, details] = mappedCourse;
      const courseObj: Course = {
        code: courseCode,
        name: name,
        credits: details.credits,
        prerequisites: course.prerequisites ? [course.prerequisites] : [],
        semester: details.semester,
        year: details.year,
        category: details.category,
        difficulty: details.difficulty
      };

      const yearData = plan.years[details.year];
      if (yearData && yearData[details.semester]) {
        yearData[details.semester].push(courseObj);
      }
    } else {
      // Add as general elective
      const year = Math.min(4, Math.floor(index / 3) + 1);
      const semester = index % 2 === 0 ? 'Fall' : 'Spring';
      
      const courseObj: Course = {
        code: courseCode,
        name: courseName,
        credits: 3,
        prerequisites: course.prerequisites ? [course.prerequisites] : [],
        semester: semester as 'Fall' | 'Spring',
        year: year,
        category: 'Elective',
        difficulty: 'Intermediate'
      };

      plan.years[year][semester as 'Fall' | 'Spring'].push(courseObj);
    }
  });

  // Add prerequisite relationships
  plan.prerequisites = {
    'Data Structures': ['Introduction to Computer Science'],
    'Algorithms': ['Data Structures', 'Calculus I'],
    'Software Engineering': ['Algorithms', 'Data Structures'],
    'Machine Learning': ['Statistics', 'Linear Algebra'],
    'Database Systems': ['Data Structures'],
    'Web Development': ['Introduction to Computer Science'],
    'Advanced Programming': ['Algorithms'],
    'Capstone Project': ['Software Engineering']
  };

  // Add recommendations based on career
  plan.recommendations = [
    `Focus on ${career} core skills throughout your academic journey`,
    'Take advantage of internships and co-op programs',
    'Join relevant student organizations and clubs',
    'Build a portfolio of projects related to your career goals',
    'Consider pursuing relevant certifications',
    'Network with professionals in your field',
    'Stay updated with industry trends and technologies'
  ];

  return plan;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json({ 
        error: "Invalid JSON in request body",
        plan: null
      }, { status: 400 });
    }

    const { career, recommendedCourses = [] } = requestBody;

    if (!career || typeof career !== 'string') {
      return NextResponse.json({ 
        error: "Career is required and must be a string",
        plan: null
      }, { status: 400 });
    }

    // Generate academic plan
    const academicPlan = generateAcademicPlan(career, recommendedCourses);

    return NextResponse.json({ 
      plan: academicPlan,
      career: career.trim()
    });

  } catch (error) {
    console.error("Error in academic schedule API:", error);
    return NextResponse.json(
      { error: "Internal server error", plan: null },
      { status: 500 }
    );
  }
}
