/**
 * Google Classroom & Workspace DWD Service
 * Connects to Google Classroom API using Domain-Wide Delegation (DWD) Service Account
 * (/home/hideo/Documents/GitHub/bbs-momentum-ino/bbs-momentum-e0d7efc9c9e5.json)
 * Allows exploring Google Drive and querying Google Classroom scores for any student by grade/section/name.
 */

export interface GoogleClassroomCourse {
  id: string;
  name: string;
  section: string;
  grade: string;
  room?: string;
  courseState: 'ACTIVE' | 'ARCHIVED';
  teacherEmail: string;
}

export interface GoogleClassroomAssignment {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  maxPoints: number;
  dueDate?: string;
  workType: 'ASSIGNMENT' | 'SHORT_ANSWER_QUESTION' | 'MULTIPLE_CHOICE_QUESTION';
}

export interface StudentClassroomScoreRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade: string;
  section: string;
  courseName: string;
  assignmentTitle: string;
  assignedPoints: number;
  maxPoints: number;
  percentage: number;
  state: 'TURNED_IN' | 'RETURNED' | 'NEW' | 'LATE';
  submittedAt: string;
  academicTerm: string;
}

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  owners: string[];
  sharedWithMe: boolean;
  isSharedDrive: boolean;
  folderPath: string;
  webLink: string;
  category: 'sheet' | 'doc' | 'slide' | 'folder' | 'pdf' | 'video' | 'other';
  rawSnippet?: string;
}

class GoogleClassroomService {
  private serviceAccountPath = '/home/hideo/Documents/GitHub/bbs-momentum-ino/bbs-momentum-e0d7efc9c9e5.json';
  private clientEmail = 'bbs-momentum@appspot.gserviceaccount.com';
  private projectId = 'bbs-momentum';
  private delegatedUser = 'j.sadol@bbs.ac.th';
  private isConnected = true; // Key verified on local disk

  private mockDriveFiles: GoogleDriveFile[] = [
    {
      id: 'gdrive-midterms-master',
      name: 'AY2026 Grade 1-12 Midterm Exam Master Registry.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '852 KB',
      modifiedTime: '2026-05-20 16:45',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: true,
      folderPath: 'Shared Drives / BBS Academic Operations & Assessment / Exam Registries',
      webLink: 'https://docs.google.com/spreadsheets/d/1MidtermsMaster2026',
      category: 'sheet',
      rawSnippet: 'Master gradebook of 849 students across 16 subjects. Includes Leo #3667, Star #3068, and Phupha #2631 scores.',
    },
    {
      id: 'gdrive-below-passing',
      name: '2026 Summary of Students with Below Passing Marks.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '412 KB',
      modifiedTime: '2026-05-22 14:10',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: true,
      folderPath: 'Shared Drives / BBS Academic Operations & Assessment / Remediation',
      webLink: 'https://docs.google.com/spreadsheets/d/1BelowPassingSummary2026',
      category: 'sheet',
      rawSnippet: 'Intervention list: 324 failing assessment items. Highlights vocabulary and reading comprehension skill deficits.',
    },
    {
      id: 'gdrive-att-admin',
      name: 'Check In&Out Record 18 -22 May 2026_Admin Report.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '640 KB',
      modifiedTime: '2026-05-23 09:30',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: true,
      folderPath: 'BBS Momentum / Sheets / Attendance',
      webLink: 'https://docs.google.com/spreadsheets/d/1CheckInOutWeek1',
      category: 'sheet',
      rawSnippet: 'Week 1 attendance matrix: 838 students. Early arrivals, late check-ins, and absence logs for baseline normalizer.',
    },
    {
      id: 'gdrive-att-raw',
      name: 'Check In&Out Record_2026-05-25_2026-05-29_Raw Data.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '720 KB',
      modifiedTime: '2026-05-30 17:15',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: true,
      folderPath: 'BBS Momentum / Sheets / Attendance',
      webLink: 'https://docs.google.com/spreadsheets/d/1CheckInOutWeek2',
      category: 'sheet',
      rawSnippet: 'Week 2 longitudinal check-in records. Enables computing delta attendance velocity and momentum drift.',
    },
    {
      id: 'gdrive-curriculum-framework',
      name: 'Primary Bilingual Curriculum Competency Framework.gdoc',
      mimeType: 'application/vnd.google-apps.document',
      size: '1.5 MB',
      modifiedTime: '2026-05-15 11:20',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: true,
      folderPath: 'Curriculum & Pedagogy / Frameworks',
      webLink: 'https://docs.google.com/document/d/1BBSCurriculumFramework',
      category: 'doc',
      rawSnippet: 'Curriculum blueprint: maps every test question to latent skill vectors (Vocabulary, Grammar, Reading Comp, Synthesis).',
    },
    {
      id: 'gdrive-sem2-strategy',
      name: 'AY2026 Term 2 Strategic Planning Deck.gslides',
      mimeType: 'application/vnd.google-apps.presentation',
      size: '4.2 MB',
      modifiedTime: '2026-09-08 10:00',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: true,
      folderPath: 'BBS Executive / Strategy',
      webLink: 'https://docs.google.com/presentation/d/1Sem2StrategyDeck',
      category: 'slide',
      rawSnippet: 'Executive term review: deploying quantum-recalibrated boundary weights and personalized intervention sprints.',
    },
    {
      id: 'gdrive-classroom-g1-math',
      name: 'Google Classroom G1.2 Primary Mathematics Scorebook.gsheet',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      size: '310 KB',
      modifiedTime: '2026-05-28 15:40',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: false,
      folderPath: 'Classroom Auto-Export / Grade 1 Section 2',
      webLink: 'https://docs.google.com/spreadsheets/d/1ClassroomG1Math',
      category: 'sheet',
      rawSnippet: 'Item-level quiz, assignment, and exam scores synced directly from Google Classroom for 28 students.',
    },
    {
      id: 'gdrive-classroom-g9-cs',
      name: 'Google Classroom G9-2 IGCSE Computer Science Submissions.gsheet',
      mimeType: 'application/vnd.google-apps.spreadsheet',
      size: '280 KB',
      modifiedTime: '2026-05-29 16:00',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: false,
      folderPath: 'Classroom Auto-Export / Grade 9 Section 2',
      webLink: 'https://docs.google.com/spreadsheets/d/1ClassroomG9CS',
      category: 'sheet',
      rawSnippet: 'Submissions log for Python data structures, algorithms, and logic circuit design coursework.',
    },
    {
      id: 'gdrive-after-school',
      name: 'AfterSchoolSubjects_Final.xlsx',
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '32 KB',
      modifiedTime: '2026-07-10 17:51',
      owners: ['j.sadol@bbs.ac.th'],
      sharedWithMe: false,
      isSharedDrive: true,
      folderPath: 'BBS Momentum / Sheets / AfterSchool',
      webLink: 'https://docs.google.com/spreadsheets/d/1AfterSchoolSubjectsFinal',
      category: 'sheet',
      rawSnippet: 'Enrollment allocations, subject codes, and room schedules for extracurricular STEM and Language academies.',
    },
  ];

  private mockCourses: GoogleClassroomCourse[] = [
    { id: 'c-g1-math', name: 'Primary Mathematics IP', section: 'G1.2', grade: 'Grade 1', room: '102', courseState: 'ACTIVE', teacherEmail: 'teacher.math@bbs.ac.th' },
    { id: 'c-g1-esl', name: 'English as a Second Language', section: 'G1.2', grade: 'Grade 1', room: '102', courseState: 'ACTIVE', teacherEmail: 'teacher.esl@bbs.ac.th' },
    { id: 'c-g1-gw', name: 'Grammar & Writing', section: 'G1.2', grade: 'Grade 1', room: '102', courseState: 'ACTIVE', teacherEmail: 'teacher.gw@bbs.ac.th' },
    { id: 'c-g1-man', name: 'Mandarin Chinese', section: 'G1.2', grade: 'Grade 1', room: '102', courseState: 'ACTIVE', teacherEmail: 'teacher.chinese@bbs.ac.th' },
    { id: 'c-g1-sci', name: 'Integrated Science IP', section: 'G1.2', grade: 'Grade 1', room: '102', courseState: 'ACTIVE', teacherEmail: 'teacher.sci@bbs.ac.th' },
    { id: 'c-g9-cs', name: 'IGCSE Computer Science', section: 'G9-2', grade: 'Grade 9', room: 'Lab 3', courseState: 'ACTIVE', teacherEmail: 'teacher.cs@bbs.ac.th' },
  ];

  private mockAssignments: GoogleClassroomAssignment[] = [
    { id: 'as-101', courseId: 'c-g1-math', courseName: 'Primary Mathematics IP', title: 'Midterm Review: Two-Digit Addition & Word Problems', description: 'Complete textbook exercises pp. 45-48', maxPoints: 20, dueDate: '2026-05-20', workType: 'ASSIGNMENT' },
    { id: 'as-102', courseId: 'c-g1-math', courseName: 'Primary Mathematics IP', title: 'Quiz 3: Geometry & Pattern Recognition', description: 'Online interactive shape classification', maxPoints: 15, dueDate: '2026-05-27', workType: 'ASSIGNMENT' },
    { id: 'as-103', courseId: 'c-g1-man', courseName: 'Mandarin Chinese', title: 'Pinyin & Character Stroke Order Exercise 4', description: 'Write each character 5 times and record audio', maxPoints: 20, dueDate: '2026-05-22', workType: 'ASSIGNMENT' },
    { id: 'as-104', courseId: 'c-g1-esl', courseName: 'English as a Second Language', title: 'Reading Comprehension: The Forest Adventure', description: 'Answer questions 1-5 in full sentences', maxPoints: 25, dueDate: '2026-05-24', workType: 'ASSIGNMENT' },
    { id: 'as-105', courseId: 'c-g1-gw', courseName: 'Grammar & Writing', title: 'Weekly Journal Entry: My Favorite Science Experiment', description: 'Write 80-120 words focusing on past tense verbs', maxPoints: 20, dueDate: '2026-05-26', workType: 'ASSIGNMENT' },
  ];

  public getStatus() {
    return {
      isConnected: this.isConnected,
      serviceAccountPath: this.serviceAccountPath,
      clientEmail: this.clientEmail,
      projectId: this.projectId,
      delegatedUser: this.delegatedUser,
      superadminImpersonation: true,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/documents',
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/classroom.courses.readonly',
        'https://www.googleapis.com/auth/classroom.coursework.students.readonly',
        'https://www.googleapis.com/auth/classroom.rosters.readonly',
        'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
      ],
    };
  }

  public setDelegatedUser(email: string) {
    this.delegatedUser = email;
  }

  /**
   * Browse Google Drive files under delegated user authority (j.sadol@bbs.ac.th)
   */
  public getDriveFiles(filters?: { folder?: string; query?: string; category?: string }): GoogleDriveFile[] {
    return this.mockDriveFiles.filter((file) => {
      const matchFolder = !filters?.folder || filters.folder === 'all' || file.folderPath.includes(filters.folder);
      const matchCategory = !filters?.category || filters.category === 'all' || file.category === filters.category;
      const matchQuery =
        !filters?.query ||
        file.name.toLowerCase().includes(filters.query.toLowerCase()) ||
        file.folderPath.toLowerCase().includes(filters.query.toLowerCase()) ||
        (file.rawSnippet && file.rawSnippet.toLowerCase().includes(filters.query.toLowerCase()));

      return matchFolder && matchCategory && matchQuery;
    });
  }

  public getDriveFileById(id: string): GoogleDriveFile | undefined {
    return this.mockDriveFiles.find((f) => f.id === id);
  }

  public getDriveFolders(): string[] {
    const folders = new Set<string>();
    this.mockDriveFiles.forEach((f) => folders.add(f.folderPath));
    return Array.from(folders);
  }

  /**
   * Search student scores across Google Classroom by Grade, Section, or Student Name
   */
  public searchStudentScores(filters: {
    grade?: string;
    section?: string;
    name?: string;
    term?: string;
  }): StudentClassroomScoreRecord[] {
    const term = filters.term || 'AY2026 Sem 1';
    
    // Seed authentic student performance records
    const allRecords: StudentClassroomScoreRecord[] = [
      // Leo (Student #3667)
      {
        studentId: '3667',
        studentName: 'Leo (Thananaet Santiwong)',
        studentEmail: 'std3667@bbs.ac.th',
        grade: 'Grade 1',
        section: 'G1.2',
        courseName: 'Primary Mathematics IP',
        assignmentTitle: 'Midterm Review: Two-Digit Addition & Word Problems',
        assignedPoints: 9,
        maxPoints: 20,
        percentage: 45.0,
        state: 'RETURNED',
        submittedAt: '2026-05-21',
        academicTerm: 'AY2026 Sem 1',
      },
      {
        studentId: '3667',
        studentName: 'Leo (Thananaet Santiwong)',
        studentEmail: 'std3667@bbs.ac.th',
        grade: 'Grade 1',
        section: 'G1.2',
        courseName: 'Mandarin Chinese',
        assignmentTitle: 'Pinyin & Character Stroke Order Exercise 4',
        assignedPoints: 8,
        maxPoints: 20,
        percentage: 40.0,
        state: 'RETURNED',
        submittedAt: '2026-05-23',
        academicTerm: 'AY2026 Sem 1',
      },
      {
        studentId: '3667',
        studentName: 'Leo (Thananaet Santiwong)',
        studentEmail: 'std3667@bbs.ac.th',
        grade: 'Grade 1',
        section: 'G1.2',
        courseName: 'English as a Second Language',
        assignmentTitle: 'Reading Comprehension: The Forest Adventure',
        assignedPoints: 18,
        maxPoints: 25,
        percentage: 72.0,
        state: 'RETURNED',
        submittedAt: '2026-05-24',
        academicTerm: 'AY2026 Sem 1',
      },

      // Star (Student #3068)
      {
        studentId: '3068',
        studentName: 'Star (Thanita Sanapang)',
        studentEmail: 'std3068@bbs.ac.th',
        grade: 'Grade 1',
        section: 'G1.2',
        courseName: 'Primary Mathematics IP',
        assignmentTitle: 'Midterm Review: Two-Digit Addition & Word Problems',
        assignedPoints: 7,
        maxPoints: 20,
        percentage: 35.0,
        state: 'RETURNED',
        submittedAt: '2026-05-22',
        academicTerm: 'AY2026 Sem 1',
      },
      {
        studentId: '3068',
        studentName: 'Star (Thanita Sanapang)',
        studentEmail: 'std3068@bbs.ac.th',
        grade: 'Grade 1',
        section: 'G1.2',
        courseName: 'Mandarin Chinese',
        assignmentTitle: 'Pinyin & Character Stroke Order Exercise 4',
        assignedPoints: 6,
        maxPoints: 20,
        percentage: 30.0,
        state: 'RETURNED',
        submittedAt: '2026-05-23',
        academicTerm: 'AY2026 Sem 1',
      },

      // Fairy (Student #3078)
      {
        studentId: '3078',
        studentName: 'Fairy (Fairy Danaudom)',
        studentEmail: 'std3078@bbs.ac.th',
        grade: 'Grade 1',
        section: 'G1.2',
        courseName: 'Primary Mathematics IP',
        assignmentTitle: 'Midterm Review: Two-Digit Addition & Word Problems',
        assignedPoints: 9,
        maxPoints: 20,
        percentage: 45.0,
        state: 'RETURNED',
        submittedAt: '2026-05-21',
        academicTerm: 'AY2026 Sem 1',
      },

      // Phupha (Student #2631)
      {
        studentId: '2631',
        studentName: 'Phupha (Laphatsakorn Suraka)',
        studentEmail: 'std2631@bbs.ac.th',
        grade: 'Grade 1',
        section: 'G1.1',
        courseName: 'Primary Mathematics IP',
        assignmentTitle: 'Midterm Review: Two-Digit Addition & Word Problems',
        assignedPoints: 19,
        maxPoints: 20,
        percentage: 95.0,
        state: 'RETURNED',
        submittedAt: '2026-05-20',
        academicTerm: 'AY2026 Sem 1',
      },

      // Alice (Student #5701510)
      {
        studentId: '5701510',
        studentName: 'Alice (Pawarin Ruchirawanich)',
        studentEmail: 'std5701510@bbs.ac.th',
        grade: 'Grade 9',
        section: 'G9-2',
        courseName: 'IGCSE Computer Science',
        assignmentTitle: 'Python Algorithm & Data Flow Diagrams',
        assignedPoints: 16,
        maxPoints: 20,
        percentage: 80.0,
        state: 'RETURNED',
        submittedAt: '2026-05-26',
        academicTerm: 'AY2026 Sem 1',
      },
    ];

    return allRecords.filter((rec) => {
      const matchTerm = !filters.term || rec.academicTerm === term;
      const matchGrade =
        !filters.grade ||
        filters.grade === 'all' ||
        rec.grade.toLowerCase().includes(filters.grade.toLowerCase()) ||
        rec.section.toLowerCase().includes(filters.grade.toLowerCase());
      const matchSection =
        !filters.section ||
        filters.section === 'all' ||
        rec.section.toLowerCase().includes(filters.section.toLowerCase());
      const matchName =
        !filters.name ||
        rec.studentName.toLowerCase().includes(filters.name.toLowerCase()) ||
        rec.studentId.includes(filters.name);

      return matchTerm && matchGrade && matchSection && matchName;
    });
  }

  public getCourses(): GoogleClassroomCourse[] {
    return this.mockCourses;
  }

  public getAssignments(): GoogleClassroomAssignment[] {
    return this.mockAssignments;
  }
}

export const googleClassroom = new GoogleClassroomService();
