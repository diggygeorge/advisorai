// File: buHubCourses.ts

export interface CourseHub {
  semester: string;
  courseCode: string;
  courseName: string;
  hubUnits: string[]; // abbreviations of BU_HUB_UNITS
  status?: 'Completed' | 'In Progress' | 'Missing';
}

export const buCoursesHub: CourseHub[] = [
  // Fall 2023
  { semester: 'Fall 2023', courseCode: 'CC 101', courseName: 'CC 101', hubUnits: ['AEX','CRI','FYW'], status: 'Completed' },
  { semester: 'Fall 2023', courseCode: 'CS 111', courseName: 'CS 111', hubUnits: ['CRI','CRT','QR2'], status: 'Completed' },
  { semester: 'Fall 2023', courseCode: 'HI 300', courseName: 'HI 300', hubUnits: ['AEX','CRT','HCO'], status: 'Completed' },
  { semester: 'Fall 2023', courseCode: 'MA 123', courseName: 'MA 123', hubUnits: ['CRT','QR2'], status: 'Completed' },

  // Spring 2024
  { semester: 'Spring 2024', courseCode: 'QST SM 131', courseName: 'QST SM 131', hubUnits: ['ETR','TWC'], status: 'Completed' },
  { semester: 'Spring 2024', courseCode: 'CS 112', courseName: 'CS 112', hubUnits: ['CRI','CRT','QR2'], status: 'Completed' },
  { semester: 'Spring 2024', courseCode: 'CS 131', courseName: 'CS 131', hubUnits: ['CRT','QR2'], status: 'Completed' },
  { semester: 'Spring 2024', courseCode: 'LK 111', courseName: 'LK 111', hubUnits: ['IIC'], status: 'Completed' },

  // Fall 2024
  { semester: 'Fall 2024', courseCode: 'CS 132', courseName: 'CS 132', hubUnits: ['DME','QR2'], status: 'Completed' },
  { semester: 'Fall 2024', courseCode: 'CS 210', courseName: 'CS 210', hubUnits: ['QR2'], status: 'Completed' },
  { semester: 'Fall 2024', courseCode: 'QST SM 132', courseName: 'QST SM 132', hubUnits: [], status: 'Completed' },
  { semester: 'Fall 2024', courseCode: 'WR 152', courseName: 'WR 152', hubUnits: ['DME','RIL','WRI'], status: 'Completed' },
  { semester: 'Fall 2024', courseCode: 'LK 112', courseName: 'LK 112', hubUnits: ['IIC'], status: 'Completed' },

  // Spring 2025
  { semester: 'Spring 2025', courseCode: 'CS 237', courseName: 'CS 237', hubUnits: ['CRT','QR2'], status: 'Completed' },
  { semester: 'Spring 2025', courseCode: 'CS 330', courseName: 'CS 330', hubUnits: ['CRT','QR2'], status: 'Completed' },
  { semester: 'Spring 2025', courseCode: 'EC 102', courseName: 'EC 102', hubUnits: ['GCI','SO1'], status: 'Completed' },
  { semester: 'Spring 2025', courseCode: 'LK 211', courseName: 'LK 211', hubUnits: ['IIC'], status: 'Completed' },

  // Fall 2025 (Enrolled)
  { semester: 'Fall 2025', courseCode: 'CC 221', courseName: 'CC 221', hubUnits: ['HCO','SO2','WIN'], status: 'In Progress' },
  { semester: 'Fall 2025', courseCode: 'CS 460', courseName: 'CS 460', hubUnits: [], status: 'In Progress' },
  { semester: 'Fall 2025', courseCode: 'LK 212', courseName: 'LK 212', hubUnits: ['GCI','IIC'], status: 'In Progress' },
  { semester: 'Fall 2025', courseCode: 'CS 351', courseName: 'CS 351', hubUnits: [], status: 'In Progress' },

  // Missing Hub Units
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Philosophical Inquiry', hubUnits: ['PLM'], status: 'Missing' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Oral/Signed Communication', hubUnits: ['OSC'], status: 'Missing' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Teamwork/Collaboration', hubUnits: ['TWC'], status: 'Missing' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Teamwork/Collaboration', hubUnits: ['TWC'], status: 'Missing' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Research & Inquiry', hubUnits: ['RIL'], status: 'Missing' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Research & Inquiry', hubUnits: ['RIL'], status: 'Missing' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Writing Intensive Course', hubUnits: ['WRI'], status: 'In Progress' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Writing Intensive Course', hubUnits: ['WRI'], status: 'Missing' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Global Citizenship & Literacy', hubUnits: ['GCI'], status: 'In Progress' },
  { semester: 'N/A', courseCode: 'Missing', courseName: 'Social Inquiry 2', hubUnits: ['SO2'], status: 'In Progress' },
]