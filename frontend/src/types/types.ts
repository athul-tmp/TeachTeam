export interface User {
  userID: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'candidate' | 'lecturer';
  createdAt: string;
  isBlocked: boolean;
  candidate?: Candidate;
  lecturer?: Lecturer;
}

export interface Lecturer {
  lecturerID: number;
  user: User;
  lecturerCourses?: LecturerCourse[];
  selectedCandidates?: SelectedCandidate[];
  comments?: Comment[];
}

export interface Candidate {
  candidateID: number;
  previousRoles?: string;
  availability: 'part-time' | 'full-time';
  skills?: string;
  academicCredentials?: string;
  user: User;
}

export interface Course {
  courseID: number;
  code: string;
  name: string;
  semester: string;
}

export interface LecturerCourse {
  lecturerID: number;
  courseID: number;
  lecturer: Lecturer;
  course: Course;
}

export interface SelectedCandidate {
  lecturerID: number;
  candidateID: number;
  preferenceRanking: number;
  lecturer: Lecturer;
  candidate: Candidate;
}

export interface AppliedCourse {
  candidateID: number;
  courseID: number;
  role: 'tutor' | 'lab_assistant';
  candidate: Candidate;
  course: Course;
}

export interface Comment {
  commentID: number;
  createdAt: string;
  content: string;
  candidateID: number;
  lecturerID: number;
  candidate?: Candidate;
  lecturer?: Lecturer;
}
