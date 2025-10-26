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
  
    // Missing Hub Units - Recommended Courses
    { semester: 'Recommended', courseCode: 'WR 152', courseName: 'Writing, Research, & Inquiry', hubUnits: ['DME','RIL','WRI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'ASL 2', courseName: 'American Sign Language II', hubUnits: ['OSC','IIC'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'ASL 3', courseName: 'American Sign Language III', hubUnits: ['IIC'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'ASL 4', courseName: 'American Sign Language IV', hubUnits: ['OSC','IIC'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'PH 100', courseName: 'Introduction to Philosophy', hubUnits: ['PLM','CRI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'PH 150', courseName: 'Philosophical Classics', hubUnits: ['PLM','HCO'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS SO 101', courseName: 'Introduction to Sociology', hubUnits: ['SO1','SO2'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS PS 101', courseName: 'Introduction to Psychology', hubUnits: ['SO1','CRI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS AN 102', courseName: 'Introduction to Anthropology', hubUnits: ['SO1','GCI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS WS 101', courseName: 'Introduction to Women\'s Studies', hubUnits: ['SO2','GCI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'COM CM 211', courseName: 'Communication Theory', hubUnits: ['TWC','OSC'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'COM CM 315', courseName: 'Teamwork & Leadership', hubUnits: ['TWC','ETR'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS BI 108', courseName: 'Introduction to Biology', hubUnits: ['CRI','QR2'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS CH 101', courseName: 'General Chemistry I', hubUnits: ['CRI','QR2'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS EN 200', courseName: 'Environmental Science', hubUnits: ['ETR','GCI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS AR 100', courseName: 'Introduction to Art', hubUnits: ['AEX','CRT'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS MU 101', courseName: 'Introduction to Music', hubUnits: ['AEX','HCO'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CFA TH 101', courseName: 'Introduction to Theatre', hubUnits: ['AEX','CRT'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS CS 105', courseName: 'Introduction to Databases', hubUnits: ['DME','QR2'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS CS 108', courseName: 'Introduction to Web Development', hubUnits: ['DME','CRT'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS HI 200', courseName: 'World History', hubUnits: ['HCO','GCI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS EC 101', courseName: 'Introduction to Microeconomics', hubUnits: ['SO1','QR2'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS PO 111', courseName: 'Introduction to Political Science', hubUnits: ['SO2','ETR'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'WR 100', courseName: 'Writing Seminar', hubUnits: ['FYW','WRI'], status: 'Missing' },
    { semester: 'Recommended', courseCode: 'CAS RN 101', courseName: 'Introduction to Religion', hubUnits: ['PLM','GCI'], status: 'Missing' },
  ]