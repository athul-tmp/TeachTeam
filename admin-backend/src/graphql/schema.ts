import gql from "graphql-tag";

// Reference: Based on Week 10 tutorial code
export const typeDefs = gql`
  enum UserRole {
    candidate
    lecturer
  }

  enum Availability {
    part_time
    full_time
  }

  enum CourseRole {
    tutor
    lab_assistant
  }

  type Admin {
    adminID: ID!
    username: String!
    password: String!
  }

  type User {
    userID: ID!
    email: String!
    password: String!
    firstName: String!
    lastName: String!
    role: UserRole!
    createdAt: String!
    isBlocked: Boolean!
  }

  type Lecturer {
    lecturerID: ID!
    user: User!
    lecturerCourses: [LecturerCourse!]
    selectedCandidates: [SelectedCandidate!]
  }

  type Candidate {
    candidateID: ID!
    user: User!
    previousRoles: String
    availability: Availability
    skills: String
    academicCredentials: String
    appliedCourses: [AppliedCourse!]
    selectedByLecturers: [SelectedCandidate!]
  }

  type Course {
    courseID: ID!
    code: String!
    name: String!
    semester: String!
    lecturerCourses: [LecturerCourse!]
    appliedCourses: [AppliedCourse!]
  }

  type LecturerCourse {
    lecturerID: Int!
    courseID: Int!
    lecturer: Lecturer!
    course: Course!
  }

  type SelectedCandidate {
    lecturerID: Int!
    candidateID: Int!
    preferenceRanking: Int!
    lecturer: Lecturer!
    candidate: Candidate!
  }

  type AppliedCourse {
    candidateID: Int!
    courseID: Int!
    role: CourseRole!
    candidate: Candidate!
    course: Course!
  }

  type CourseWithSelectedCandidates {
    courseID: ID!
    code: String!
    name: String!
    semester: String!
    selectedCandidates: [Candidate!]!
  }

  type Query {
    candidatesChosenByCourse: [CourseWithSelectedCandidates!]!
    candidatesWithMoreThanThreeSelections: [Candidate!]!
    candidatesWithNoSelections: [Candidate!]!

    allLecturers: [Lecturer!]!
    allCourses: [Course!]!
    allCandidates: [Candidate!]!
    user(userID: ID!): User
  }

  type Mutation {
    # Lecturer-course assignments
    assignLecturerToCourse(lecturerID: Int!, courseID: Int!): Boolean!

    # Course management
    addCourse(code: String!, name: String!, semester: String!): Course!
    updateCourse(courseID: Int!, code: String, name: String, semester: String): Course!
    deleteCourse(courseID: Int!): Boolean!

    # Candidate account control
    blockCandidate(userID: Int!): Boolean!
    unblockCandidate(userID: Int!): Boolean!

    # Handles login for admin
    adminLogin(username: String!, password: String!): Admin
  }
`;
