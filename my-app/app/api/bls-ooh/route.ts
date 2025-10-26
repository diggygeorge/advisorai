import { NextRequest, NextResponse } from 'next/server';

interface BLSOccupation {
  code: string;
  title: string;
  description: string;
  skills: string[];
  education: string;
  median_salary: number;
  job_outlook: string;
  work_environment: string;
  related_occupations: string[];
  typical_duties: string[];
}

// Expanded career database with BLS OOH data
const blsCareers: BLSOccupation[] = [
  // Technology & Computer Science
  {
    code: "15-1132",
    title: "Software Developers",
    description: "Software developers design computer applications or programs. Software quality assurance analysts and testers identify problems with applications or programs and report defects.",
    skills: ["Programming", "Problem Solving", "Critical Thinking", "Software Design", "Database Management", "System Analysis", "Project Management", "Communication", "Teamwork", "Continuous Learning"],
    education: "Bachelor's degree in computer science, software engineering, or a related field",
    median_salary: 110140,
    job_outlook: "22% growth from 2020 to 2030",
    work_environment: "Office settings, remote work possible",
    related_occupations: ["Computer Programmers", "Computer Systems Analysts", "Database Administrators"],
    typical_duties: ["Design software applications", "Write and test code", "Debug programs", "Collaborate with teams", "Maintain software systems"]
  },
  {
    code: "15-1131",
    title: "Computer Programmers",
    description: "Computer programmers write, modify, and test code and scripts that allow computer software and applications to function properly.",
    skills: ["Programming", "Debugging", "Problem Solving", "Attention to Detail", "Logical Thinking", "Database Knowledge", "Version Control", "Testing", "Documentation", "Collaboration"],
    education: "Bachelor's degree in computer science or a related field",
    median_salary: 89390,
    job_outlook: "-10% decline from 2020 to 2030",
    work_environment: "Office settings, remote work common",
    related_occupations: ["Software Developers", "Computer Systems Analysts", "Web Developers"],
    typical_duties: ["Write code", "Test programs", "Debug software", "Update existing programs", "Create technical documentation"]
  },
  {
    code: "15-2051",
    title: "Data Scientists",
    description: "Data scientists use analytical tools and techniques to extract meaningful insights from data. They work with large datasets to identify trends and patterns.",
    skills: ["Statistics", "Programming", "Machine Learning", "Data Analysis", "Critical Thinking", "Mathematics", "Problem Solving", "Communication", "Visualization", "Database Management"],
    education: "Master's degree in data science, statistics, computer science, or a related field",
    median_salary: 103500,
    job_outlook: "35% growth from 2020 to 2030",
    work_environment: "Office settings, remote work possible",
    related_occupations: ["Statisticians", "Computer Systems Analysts", "Operations Research Analysts"],
    typical_duties: ["Analyze large datasets", "Build predictive models", "Create data visualizations", "Present findings to stakeholders", "Develop data collection methods"]
  },
  {
    code: "15-1134",
    title: "Web Developers",
    description: "Web developers design and create websites. They are responsible for the look of the site and the site's technical aspects, such as its performance and capacity.",
    skills: ["Programming", "Web Design", "HTML/CSS", "JavaScript", "Problem Solving", "Creativity", "Attention to Detail", "Communication", "Project Management", "User Experience"],
    education: "Associate's degree in web design or related field, or equivalent experience",
    median_salary: 77830,
    job_outlook: "13% growth from 2020 to 2030",
    work_environment: "Office settings, remote work common",
    related_occupations: ["Computer Programmers", "Graphic Designers", "Computer Systems Analysts"],
    typical_duties: ["Design website layouts", "Write code for websites", "Test website functionality", "Maintain and update sites", "Collaborate with clients"]
  },
  {
    code: "15-1121",
    title: "Computer Systems Analysts",
    description: "Computer systems analysts study an organization's current computer systems and procedures and design information systems solutions to help the organization operate more efficiently.",
    skills: ["Systems Analysis", "Problem Solving", "Communication", "Technical Writing", "Project Management", "Database Knowledge", "Programming", "Critical Thinking", "Teamwork", "Business Analysis"],
    education: "Bachelor's degree in computer science, information technology, or a related field",
    median_salary: 93730,
    job_outlook: "7% growth from 2020 to 2030",
    work_environment: "Office settings, some travel may be required",
    related_occupations: ["Software Developers", "Computer Programmers", "Database Administrators"],
    typical_duties: ["Analyze system requirements", "Design system solutions", "Test system implementations", "Train users", "Maintain systems"]
  },
  
  // Healthcare
  {
    code: "29-1141",
    title: "Registered Nurses",
    description: "Registered nurses (RNs) provide and coordinate patient care, educate patients and the public about various health conditions, and provide advice and emotional support to patients and their family members.",
    skills: ["Patient Care", "Communication", "Critical Thinking", "Empathy", "Attention to Detail", "Problem Solving", "Teamwork", "Medical Knowledge", "Documentation", "Stress Management"],
    education: "Bachelor's degree in nursing (BSN), associate's degree in nursing (ADN), or diploma from an approved nursing program",
    median_salary: 75330,
    job_outlook: "9% growth from 2020 to 2030",
    work_environment: "Hospitals, clinics, nursing homes, home healthcare",
    related_occupations: ["Licensed Practical Nurses", "Nurse Practitioners", "Physician Assistants"],
    typical_duties: ["Assess patient health", "Administer medications", "Monitor patient progress", "Educate patients", "Collaborate with healthcare team"]
  },
  {
    code: "29-1211",
    title: "Physicians and Surgeons",
    description: "Physicians and surgeons diagnose and treat injuries or illnesses and address health maintenance. They examine patients, take medical histories, prescribe medications, and order, perform, and interpret diagnostic tests.",
    skills: ["Medical Knowledge", "Diagnosis", "Communication", "Critical Thinking", "Problem Solving", "Empathy", "Attention to Detail", "Decision Making", "Leadership", "Continuous Learning"],
    education: "Doctor of Medicine (MD) or Doctor of Osteopathic Medicine (DO) degree",
    median_salary: 208000,
    job_outlook: "3% growth from 2020 to 2030",
    work_environment: "Hospitals, clinics, private practices",
    related_occupations: ["Nurse Practitioners", "Physician Assistants", "Dentists"],
    typical_duties: ["Examine patients", "Diagnose conditions", "Prescribe treatments", "Perform procedures", "Maintain patient records"]
  },
  
  // Business & Finance
  {
    code: "13-1111",
    title: "Management Analysts",
    description: "Management analysts, often called management consultants, propose ways to improve an organization's efficiency. They advise managers on how to make organizations more profitable through reduced costs and increased revenues.",
    skills: ["Analytical Thinking", "Communication", "Problem Solving", "Data Analysis", "Presentation Skills", "Project Management", "Business Knowledge", "Critical Thinking", "Teamwork", "Client Relations"],
    education: "Bachelor's degree in business, management, or a related field",
    median_salary: 87660,
    job_outlook: "14% growth from 2020 to 2030",
    work_environment: "Office settings, travel to client sites",
    related_occupations: ["Operations Research Analysts", "Financial Analysts", "Market Research Analysts"],
    typical_duties: ["Analyze business processes", "Develop improvement strategies", "Present recommendations", "Implement changes", "Monitor results"]
  },
  {
    code: "13-2051",
    title: "Financial Analysts",
    description: "Financial analysts provide guidance to businesses and individuals making investment decisions. They assess the performance of stocks, bonds, and other types of investments.",
    skills: ["Financial Analysis", "Mathematics", "Critical Thinking", "Communication", "Attention to Detail", "Problem Solving", "Research", "Computer Skills", "Presentation Skills", "Decision Making"],
    education: "Bachelor's degree in finance, economics, accounting, or a related field",
    median_salary: 83170,
    job_outlook: "6% growth from 2020 to 2030",
    work_environment: "Office settings, some travel may be required",
    related_occupations: ["Personal Financial Advisors", "Securities, Commodities, and Financial Services Sales Agents", "Accountants and Auditors"],
    typical_duties: ["Analyze financial data", "Prepare reports", "Make investment recommendations", "Monitor economic trends", "Assess risk"]
  },
  
  // Engineering
  {
    code: "17-2071",
    title: "Electrical Engineers",
    description: "Electrical engineers design, develop, test, and supervise the manufacture of electrical equipment, such as electric motors, radar and navigation systems, communications systems, or power generation equipment.",
    skills: ["Mathematics", "Physics", "Problem Solving", "Design", "Critical Thinking", "Communication", "Project Management", "Computer Skills", "Attention to Detail", "Teamwork"],
    education: "Bachelor's degree in electrical engineering or a related field",
    median_salary: 100830,
    job_outlook: "7% growth from 2020 to 2030",
    work_environment: "Office settings, manufacturing facilities, research laboratories",
    related_occupations: ["Electronics Engineers", "Computer Hardware Engineers", "Mechanical Engineers"],
    typical_duties: ["Design electrical systems", "Test equipment", "Supervise manufacturing", "Troubleshoot problems", "Create technical documentation"]
  },
  {
    code: "17-2141",
    title: "Mechanical Engineers",
    description: "Mechanical engineers design, develop, build, and test mechanical and thermal sensors and devices, including tools, engines, and machines.",
    skills: ["Mathematics", "Physics", "Design", "Problem Solving", "Critical Thinking", "Communication", "Project Management", "Computer Skills", "Creativity", "Attention to Detail"],
    education: "Bachelor's degree in mechanical engineering or a related field",
    median_salary: 95000,
    job_outlook: "7% growth from 2020 to 2030",
    work_environment: "Office settings, manufacturing facilities, research laboratories",
    related_occupations: ["Aerospace Engineers", "Civil Engineers", "Industrial Engineers"],
    typical_duties: ["Design mechanical systems", "Test prototypes", "Analyze test results", "Oversee manufacturing", "Maintain equipment"]
  },
  
  // Education
  {
    code: "25-2021",
    title: "Elementary School Teachers",
    description: "Elementary school teachers instruct children in kindergarten through fifth or sixth grade. They create lesson plans, teach various subjects, and help children develop fundamental skills.",
    skills: ["Communication", "Patience", "Creativity", "Organization", "Classroom Management", "Child Development", "Curriculum Planning", "Assessment", "Collaboration", "Adaptability"],
    education: "Bachelor's degree in elementary education or a related field",
    median_salary: 61270,
    job_outlook: "7% growth from 2020 to 2030",
    work_environment: "Elementary schools, public and private",
    related_occupations: ["Middle School Teachers", "High School Teachers", "Special Education Teachers"],
    typical_duties: ["Plan lessons", "Teach subjects", "Assess student progress", "Communicate with parents", "Maintain classroom discipline"]
  },
  {
    code: "25-2031",
    title: "Secondary School Teachers",
    description: "Secondary school teachers instruct students in one or more subjects at the middle, junior high, or high school level. They prepare lessons, grade papers, and help students learn.",
    skills: ["Subject Expertise", "Communication", "Classroom Management", "Organization", "Assessment", "Mentoring", "Technology Integration", "Differentiated Instruction", "Parent Communication", "Professional Development"],
    education: "Bachelor's degree in the subject they teach, plus teacher certification",
    median_salary: 62570,
    job_outlook: "8% growth from 2020 to 2030",
    work_environment: "Middle schools, high schools, public and private",
    related_occupations: ["Elementary School Teachers", "Postsecondary Teachers", "Instructional Coordinators"],
    typical_duties: ["Plan curriculum", "Teach specialized subjects", "Grade assignments", "Advise students", "Participate in school activities"]
  },
  
  // Marketing & Sales
  {
    code: "41-3011",
    title: "Advertising Sales Agents",
    description: "Advertising sales agents sell advertising space to businesses and individuals. They contact potential clients, make sales presentations, and maintain client relationships.",
    skills: ["Sales", "Communication", "Persuasion", "Relationship Building", "Negotiation", "Market Knowledge", "Presentation Skills", "Time Management", "Goal Setting", "Customer Service"],
    education: "High school diploma or equivalent, bachelor's degree preferred",
    median_salary: 54170,
    job_outlook: "4% growth from 2020 to 2030",
    work_environment: "Office settings, client meetings, travel",
    related_occupations: ["Sales Representatives", "Public Relations Specialists", "Market Research Analysts"],
    typical_duties: ["Contact potential clients", "Make sales presentations", "Negotiate contracts", "Maintain client relationships", "Meet sales targets"]
  },
  {
    code: "13-1161",
    title: "Market Research Analysts",
    description: "Market research analysts study market conditions to examine potential sales of a product or service. They help companies understand what products people want, who will buy them, and at what price.",
    skills: ["Data Analysis", "Statistics", "Research", "Critical Thinking", "Communication", "Presentation Skills", "Market Knowledge", "Problem Solving", "Attention to Detail", "Technology Skills"],
    education: "Bachelor's degree in market research, statistics, or a related field",
    median_salary: 63200,
    job_outlook: "22% growth from 2020 to 2030",
    work_environment: "Office settings, some travel may be required",
    related_occupations: ["Operations Research Analysts", "Management Analysts", "Survey Researchers"],
    typical_duties: ["Design surveys", "Collect data", "Analyze results", "Prepare reports", "Present findings"]
  }
];

function findMatchingCareers(query: string): BLSOccupation[] {
  const queryLower = query.toLowerCase();
  
  return blsCareers.filter(career => 
    career.title.toLowerCase().includes(queryLower) ||
    career.description.toLowerCase().includes(queryLower) ||
    career.skills.some(skill => skill.toLowerCase().includes(queryLower)) ||
    career.typical_duties.some(duty => duty.toLowerCase().includes(queryLower))
  );
}

function findClosestCareer(query: string): BLSOccupation | null {
  const matches = findMatchingCareers(query);
  
  if (matches.length === 0) {
    return null;
  }
  
  // Return the best match (first one for now, could be improved with scoring)
  return matches[0];
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
    const career = findClosestCareer(query);

    if (!career) {
      return NextResponse.json({ 
        error: `No matching career found for: ${query}`,
        career: null
      }, { status: 404 });
    }

    return NextResponse.json({ 
      career,
      query: query.trim(),
      source: 'BLS OOH Database'
    });

  } catch (error) {
    console.error("Error in BLS OOH API:", error);
    return NextResponse.json(
      { error: "Internal server error", career: null },
      { status: 500 }
    );
  }
}
