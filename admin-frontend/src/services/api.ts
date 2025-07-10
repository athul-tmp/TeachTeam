import { gql } from "@apollo/client";
import { client } from "./apollo-client";

// enum types
export type UserRole = "candidate" | "lecturer";
export type Availability = "part_time" | "full_time";
export type CourseRole = "tutor" | "lab_assistant";

// Types
export interface Admin {
  adminID: number;
  username: string;
  password: string;
}

export interface User {
  userID: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: string;
  isBlocked: boolean;
}

export interface Lecturer {
  lecturerID: number;
  user: User;
  lecturerCourses?: LecturerCourse[];
  selectedCandidates?: SelectedCandidate[];
}

export interface Candidate {
  candidateID: number;
  user: User;
  previousRoles?: string;
  availability?: Availability;
  skills?: string;
  academicCredentials?: string;
  appliedCourses?: AppliedCourse[];
  selectedByLecturers?: SelectedCandidate[];
}

export interface Course {
  courseID: number;
  code: string;
  name: string;
  semester: string;
  lecturerCourses?: LecturerCourse[];
  appliedCourses?: AppliedCourse[];
}

export interface LecturerCourse {
  lecturerID: number;
  courseID: number;
  lecturer?: Lecturer;
  course?: Course;
}

export interface SelectedCandidate {
  lecturerID: number;
  candidateID: number;
  preferenceRanking: number;
  lecturer?: Lecturer;
  candidate?: Candidate;
}

export interface AppliedCourse {
  candidateID: number;
  courseID: number;
  role: CourseRole;
  candidate?: Candidate;
  course?: Course;
}

export interface CourseWithSelectedCandidates {
  courseID: number;
  code: string;
  name: string;
  semester: string;
  selectedCandidates: Candidate[];
}

// Queries
export const GET_COURSES_WITH_SELECTED_CANDIDATES = gql`
  query GetCoursesWithSelectedCandidates {
    candidatesChosenByCourse {
      courseID
      code
      name
      semester
      selectedCandidates {
        candidateID
        user {
          userID
          email
          firstName
          lastName
          isBlocked
        }
      }
    }
  }
`;

export const GET_CANDIDATES_WITH_MORE_THAN_THREE_SELECTIONS = gql`
  query GetCandidatesWithMoreThanThreeSelections {
    candidatesWithMoreThanThreeSelections {
      candidateID
      user {
        userID
        email
        firstName
        lastName
        isBlocked
      }
    }
  }
`;

export const GET_CANDIDATES_WITH_NO_SELECTIONS = gql`
  query GetCandidatesWithNoSelections {
    candidatesWithNoSelections {
      candidateID
      user {
        userID
        email
        firstName
        lastName
        isBlocked
      }
    }
  }
`;

export const GET_ALL_LECTURERS = gql`
  query GetAllLecturers {
    allLecturers {
      lecturerID
      user {
        userID
        email
        firstName
        lastName
      }
      lecturerCourses {
        courseID
      }
    }
  }
`;

export const GET_ALL_COURSES = gql`
  query GetAllCourses {
    allCourses {
      courseID
      code
      name
      semester
    }
  }
`;

export const GET_ALL_CANDIDATES = gql`
  query GetAllCandidates {
    allCandidates {
      candidateID
      user {
        userID
        email
        firstName
        lastName
        isBlocked
      }
      previousRoles
      availability
      skills
      academicCredentials
    }
  }
`;

export const GET_USER_BY_ID = gql`
  query GetUser($userID: ID!) {
    user(userID: $userID) {
      userID
      email
      firstName
      lastName
      role
      createdAt
      isBlocked
    }
  }
`;

// Mutations
export const ASSIGN_LECTURER_TO_COURSE = gql`
  mutation AssignLecturerToCourse($lecturerID: Int!, $courseID: Int!) {
    assignLecturerToCourse(lecturerID: $lecturerID, courseID: $courseID)
  }
`;

export const ADD_COURSE = gql`
  mutation AddCourse($code: String!, $name: String!, $semester: String!) {
    addCourse(code: $code, name: $name, semester: $semester) {
      courseID
      code
      name
      semester
    }
  }
`;

export const UPDATE_COURSE = gql`
  mutation UpdateCourse($courseID: Int!, $code: String, $name: String, $semester: String) {
    updateCourse(courseID: $courseID, code: $code, name: $name, semester: $semester) {
      courseID
      code
      name
      semester
    }
  }
`;

export const DELETE_COURSE = gql`
  mutation DeleteCourse($courseID: Int!) {
    deleteCourse(courseID: $courseID)
  }
`;

export const BLOCK_CANDIDATE = gql`
  mutation BlockCandidate($userID: Int!) {
    blockCandidate(userID: $userID)
  }
`;

export const UNBLOCK_CANDIDATE = gql`
  mutation UnblockCandidate($userID: Int!) {
    unblockCandidate(userID: $userID)
  }
`;

export const ADMIN_LOGIN = gql`
  mutation AdminLogin($username: String!, $password: String!) {
    adminLogin(username: $username, password: $password) {
      adminID
      username
      password
    }
  }
`;

// Services
export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const { data } = await client.query({ query: GET_ALL_COURSES });
    return data.allCourses;
  },

  getCoursesWithSelectedCandidates: async (): Promise<CourseWithSelectedCandidates[]> => {
    const { data } = await client.query({ query: GET_COURSES_WITH_SELECTED_CANDIDATES });
    return data.candidatesChosenByCourse;
  },

  addCourse: async (course: { code: string; name: string; semester: string }): Promise<Course> => {
    const { data } = await client.mutate({ mutation: ADD_COURSE, variables: course });
    return data.addCourse;
  },

  updateCourse: async (
    courseID: number,
    updates: { code?: string; name?: string; semester?: string }
  ): Promise<Course> => {
    const { data } = await client.mutate({
      mutation: UPDATE_COURSE,
      variables: { courseID, ...updates },
    });
    return data.updateCourse;
  },

  deleteCourse: async (courseID: number): Promise<boolean> => {
    const { data } = await client.mutate({ mutation: DELETE_COURSE, variables: { courseID } });
    return data.deleteCourse;
  },
};

export const candidateService = {
  getAllCandidates: async (): Promise<Candidate[]> => {
    const { data } = await client.query({ query: GET_ALL_CANDIDATES });
    return data.allCandidates;
  },

  getCandidatesWithNoSelections: async (): Promise<Candidate[]> => {
    const { data } = await client.query({ query: GET_CANDIDATES_WITH_NO_SELECTIONS });
    return data.candidatesWithNoSelections;
  },

  getCandidatesWithMoreThanThreeSelections: async (): Promise<Candidate[]> => {
    const { data } = await client.query({ query: GET_CANDIDATES_WITH_MORE_THAN_THREE_SELECTIONS });
    return data.candidatesWithMoreThanThreeSelections;
  },

  blockCandidate: async (userID: number): Promise<boolean> => {
    const { data } = await client.mutate({ mutation: BLOCK_CANDIDATE, variables: { userID } });
    return data.blockCandidate;
  },

  unblockCandidate: async (userID: number): Promise<boolean> => {
    const { data } = await client.mutate({ mutation: UNBLOCK_CANDIDATE, variables: { userID } });
    return data.unblockCandidate;
  },
};

export const lecturerService = {
  getAllLecturers: async (): Promise<Lecturer[]> => {
    const { data } = await client.query({ query: GET_ALL_LECTURERS });
    return data.allLecturers;
  },

  assignLecturerToCourse: async (lecturerID: number, courseID: number): Promise<boolean> => {
    const { data } = await client.mutate({
      mutation: ASSIGN_LECTURER_TO_COURSE,
      variables: { lecturerID, courseID },
    });
    return data.assignLecturerToCourse;
  },
};

export const userService = {
  getUserByID: async (userID: number): Promise<User> => {
    const { data } = await client.query({ query: GET_USER_BY_ID, variables: { userID } });
    return data.user;
  },
};

export const adminService = {
  adminLogin: async (username: string, password: string): Promise<Admin | null> => {
    const { data } = await client.mutate({
      mutation: ADMIN_LOGIN,
      variables: { username, password },
    });

    if (!data?.adminLogin) return null;
    return data.adminLogin;
  },
};

