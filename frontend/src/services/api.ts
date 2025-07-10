/**
 * This file contains the API service layer for the frontend.
 * There are 9 services as follows:
 *  1. userService: Handles all user related API operations
 *    - getAllUsers: Fetches all users. Includes linked candidate/lecturer table data.
 *    - getOneUser: Fetches a single user using id. Includes linked candidate/lecturer table data.
 *    - createUser: Creates a new user. It automatically partially populates candidate / lecturer tables using role and userid as id for those tables
 *    - updateUser: Updates an existing user's profile (should not update role)
 *    - loginUser: Sends email and password to UserController to authenticate the user. Returns user data if valid credentials, else throws an error
 *		
 *  2. candidateService: Handles all candidate related API operations
 *    - getAllCandidates: Fetches all candidates. Includes linked user info, applied courses, comments, and selections.
 *    - getOneCandidate: Fetches a single candidate using id. Includes linked user info, applied courses, comments, and selections.
 *    - updateCandidate: Updates a candidate's profile info (skills, availability, previous roles and academic credentials.)
 *    - getAppliedCourses: Fetches info regarding course candidate applied to including applied role
 *    - getSelectedByLecturers: Fetches info regarding lecturer who selected candidate and their preference ranking of candidate
 *    - getCandidateComments: Fetches all comments made about this candidate along with lecturer id of author. 
 *
 *  3. lecturerService: Handles all lecturer related API operations
 *    -	getAllLecturers: Fetches all lecturers. Includes linked info like comments, selected candidates, ids of courses taught.
 *    - getOneLecturer: Fetches a single lecturer using id. Includes linked info like comments, selected candidates, ids of courses taught.
 *    - getCourses: Fetches all course ids assigned to the lecturer.
 *    - getSelectedCandidates: Fetches all selected candidates by the lecturer and preference ranking
 *    - getComments: Fetches all comments the lecturer has written.
 *    - getFilteredApplicants: Fetches applicants using filter criterias applied by lecturer.
 *
 *  4. courseService: Handles all course related API operations
 *    - getAllCourses: Fetches all courses.
 *    - getOneCourse: Fetches a single course using id.
 *    -	createCourse: Creates a new course. Includes code, name, and semester.
 *    -	getLecturerCourses: Fetches all lecturers assigned to a course via course id.
 *    - getAppliedCourses: Fetches all candidates applied for given course along with their role.
 *  
 *  5. appliedCourseService: Handles all appliedCourse related API operations
 *    - getAllAppliedCourses: Fetches all applied courses.
 *    -	getOneAppliedCourse: Fetches applied course using candidateid, courseid, role. Includes info of candidate and course as well as role applied for.
 *    -	createAppliedCourse: Creates a new candidate-course association along with applied role
 * 
 *  6. lecturerCourseService: Handles all lecturerCourse related API operations
 *    -	createLecturerCourse: Creates a new lecturer-course association.
 *    - deleteLecturerCourse: Deletes an existing lecturer-course association.
 *
 *  7. selectedCandidateService: Handles all selectedCandidate related API operations
 *    - getAllSelectedCandidates: Fetches all selected candidates
 *    -	getOneSelectedCandidate: Fetches based on specific lecturer and candidate.
 *    -	createSelectedCandidate: Creates new candidate-lecturer association with preference ranking.
 *    - updateSelectedCandidate: Updates an existing selection's preference ranking.
 *    -	deleteSelectedCandidate: Deletes a candidate-lecturer association (unselects a candidate).
 *    - getCandidateSelectionCounts: Fetches candidate and their selected counts.
 *
 *  8. commentService: Handles all comment related API operations
 *    -	getOneComment: Fetches a specific comment by its id.
 *    - createComment: Creates a new comment about a candidate. Links it to the authoring lecturer and target candidate using their ids.
 *    -	updateComment: Updates the content of a comment.
 *    -	deleteComment: Deletes a comment by id.
 *    -	getCommentsForCandidate: Fetches all comments made about a specific candidate using candidate id.
 *    -	getCommentsByLecturer: Fetches all comments authored by a specific lecturer using lecturer id.
 * 
 * All API calls are made to the base URL: http://localhost:3001/api
 * 
 * Reference: Based on Week 9 Lecture code
 */
import axios from "axios";
import { AxiosError } from "axios";
import {
  User,
  Candidate,
  Lecturer,
  Course,
  AppliedCourse,
  LecturerCourse,
  SelectedCandidate,
  Comment
} from "../types/types";

const API_BASE_URL = "http://localhost:3001/api";

export const userService = {

  getAllUsers: async (): Promise<User[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/user`);
    return data;
  },

  getOneUser: async (id: number): Promise<User> => {
    const { data } = await axios.get(`${API_BASE_URL}/user/${id}`);
    return data;
  },

  createUser: async (user: Partial<User>): Promise<User> => {
    const { data } = await axios.post(`${API_BASE_URL}/user`, user);
    return data;
  },

  updateUser: async (id: number, user: Partial<User>): Promise<User> => {
    const { data } = await axios.put(`${API_BASE_URL}/user/${id}`, user);
    return data;
  },

  loginUser: async (email: string, password: string): Promise<User> => {
    try {
      const { data } = await axios.post(`${API_BASE_URL}/user/login`, { email, password });
      return data;
    } catch (error) {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          throw new Error("Invalid email or password");
        }
        if (error.response?.status === 403) {
          throw new Error("Your account has been blocked. Please contact admin.");
        }
      }
      throw error;
    }
  }
};

export const candidateService = {
  getAllCandidates: async (): Promise<Candidate[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/candidate`);
    return data;
  },

  getOneCandidate: async (id: number): Promise<Candidate> => {
    const { data } = await axios.get(`${API_BASE_URL}/candidate/${id}`);
    return data;
  },

  updateCandidate: async (id: number, candidate: Partial<Candidate>): Promise<Candidate> => {
    const { data } = await axios.put(`${API_BASE_URL}/candidate/${id}`, candidate);
    return data;
  },

  getAppliedCourses: async (candidateID: number): Promise<AppliedCourse[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/candidate/${candidateID}/applied-courses`);
    return data;
  },

  getSelectedByLecturers: async (candidateID: number): Promise<SelectedCandidate[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/candidate/${candidateID}/selected-by-lecturers`);
    return data;
  },

  getCandidateComments: async (candidateID: number): Promise<Comment[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/candidate/${candidateID}/comments`);
    return data;
  }
};


export const lecturerService = {
  getAllLecturers: async (): Promise<Lecturer[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/lecturer`);
    return data;
  },

  getOneLecturer: async (id: number): Promise<Lecturer> => {
    const { data } = await axios.get(`${API_BASE_URL}/lecturer/${id}`);
    return data;
  },

  getCourses: async (lecturerID: number): Promise<LecturerCourse[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/lecturer/${lecturerID}/courses`);
    return data;
  },

  getSelectedCandidates: async (lecturerID: number): Promise<SelectedCandidate[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/lecturer/${lecturerID}/selected-candidates`);
    return data;
  },

  getComments: async (lecturerID: number): Promise<Comment[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/lecturer/${lecturerID}/comments`);
    return data;
  },

  getFilteredApplicants: async (lecturerID: number,
    filters: {
      courseID?: number;
      role?: string;
      availability?: string;
      skill?: string;
      name?: string;
      sortBy?: "course" | "availability";
      order?: "asc" | "desc";
    }): Promise<AppliedCourse[]> => {
      const params = new URLSearchParams();

      if (filters.courseID) params.append("courseID", filters.courseID.toString());
      if (filters.role) params.append("role", filters.role);
      if (filters.availability) params.append("availability", filters.availability);
      if (filters.skill) params.append("skill", filters.skill);
      if (filters.name) params.append("name", filters.name);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.order) params.append("order", filters.order);

      const { data } = await axios.get(`${API_BASE_URL}/lecturer/${lecturerID}/applicants/filter?${params.toString()}`);
      return data;
  }
};

export const courseService = {
  getAllCourses: async (): Promise<Course[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/course`);
    return data;
  },

  getOneCourse: async (id: number): Promise<Course> => {
    const { data } = await axios.get(`${API_BASE_URL}/course/${id}`);
    return data;
  },

  createCourse: async (course: Partial<Course>): Promise<Course> => {
    const { data } = await axios.post(`${API_BASE_URL}/course`, course);
    return data;
  },

  getLecturerCourses: async (courseID: number): Promise<LecturerCourse[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/course/${courseID}/lecturers`);
    return data;
  },

  getAppliedCourses: async (courseID: number): Promise<AppliedCourse[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/course/${courseID}/applied-candidates`);
    return data;
  }
};

export const appliedCourseService = {
  getAllAppliedCourses: async (): Promise<AppliedCourse[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/applied-course`);
    return data;
  },
  

  getOneAppliedCourse: async (candidateID: number, courseID: number, role: 'tutor' | 'lab_assistant'): Promise<AppliedCourse> => {
    const { data } = await axios.get(`${API_BASE_URL}/applied-course/${candidateID}/${courseID}/${role}`);
    return data;
  },

  createAppliedCourse: async (appliedCourse: Partial<AppliedCourse>): Promise<AppliedCourse> => {
    const { data } = await axios.post(`${API_BASE_URL}/applied-course`, appliedCourse);
    return data;
  },

  deleteAppliedCourse: async (
    candidateID: number,
    courseID: number,
    role: "tutor" | "lab_assistant"
  ): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/applied-course/${candidateID}/${courseID}/${role}`);
  },


};


export const lecturerCourseService = {
  createLecturerCourse: async (lecturerCourse: Partial<LecturerCourse>): Promise<LecturerCourse> => {
    const { data } = await axios.post(`${API_BASE_URL}/lecturer-course`, lecturerCourse);
    return data;
  },

  deleteLecturerCourse: async (lecturerID: number, courseID: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/lecturer-course/${lecturerID}/${courseID}`);
  }
};

export const selectedCandidateService = {
  getAllSelectedCandidates: async (): Promise<SelectedCandidate[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/selected-candidate`);
    return data;
  },

  getOneSelectedCandidate: async (lecturerID: number, candidateID: number): Promise<SelectedCandidate> => {
    const { data } = await axios.get(`
      ${API_BASE_URL}/selected-candidate/${lecturerID}/${candidateID}`
    );
    return data;
  },

  createSelectedCandidate: async (selectedCandidate: Partial<SelectedCandidate>): Promise<SelectedCandidate> => {
    const { data } = await axios.post(`${API_BASE_URL}/selected-candidate`, selectedCandidate);
    return data;
  },

  updateSelectedCandidate: async (lecturerID: number, candidateID: number, selectedCandidate: Partial<SelectedCandidate>): Promise<SelectedCandidate> => {
    const { data } = await axios.put(`${API_BASE_URL}/selected-candidate/${lecturerID}/${candidateID}`, selectedCandidate);
    return data;
  },

  deleteSelectedCandidate: async (lecturerID: number, candidateID: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/selected-candidate/${lecturerID}/${candidateID}`);
  },

  getCandidateSelectionCounts: async (): Promise<{ candidateID: string; selectedcount: number}[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/selected-candidate/candidate-selection-counts`);
    return data;
  }
};

export const commentService = {
  getOneComment: async (id: number): Promise<Comment> => {
    const { data } = await axios.get(`${API_BASE_URL}/comment/${id}`);
    return data;
  },

  createComment: async (comment: Partial<Comment>): Promise<Comment> => {
    const { data } = await axios.post(`${API_BASE_URL}/comment`, comment);
    return data;
  },

  updateComment: async (id: number, comment: Partial<Comment>): Promise<Comment> => {
    const { data } = await axios.put(`${API_BASE_URL}/comment/${id}`, comment);
    return data;
  },

  deleteComment: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/comment/${id}`);
  },

  getCommentsForCandidate: async (candidateID: number): Promise<Comment[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/comment/candidate/${candidateID}`);
    return data;
  },

  getCommentsByLecturer: async (lecturerID: number): Promise<Comment[]> => {
    const { data } = await axios.get(`${API_BASE_URL}/comment/lecturer/${lecturerID}`);
    return data;
  },
};