import { Box, Heading, Select, Button, VStack, FormControl, FormLabel, useToast, Text, Flex, Input, Spinner} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { courseService, lecturerService, Course, Lecturer, Candidate, candidateService } from "../services/api";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [selectedCourseID, setSelectedCourseID] = useState(0);
  const [selectedLecturerID, setSelectedLecturerID] = useState(0);
  const [addCourse, setAddCourse] = useState({ code: "", name: "", semester: "" });
  const [editCourseID, setEditCourseID] = useState<number | null>(null);
  const [editCourse, setEditCourse] = useState({ code: "", name: "", semester: "" });
  const [deleteCourseID, setDeleteCourseID] = useState<number | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateID, setSelectedCandidateID] = useState<number | null>(null);
  const toast = useToast();

  const { authLoading } = useAdminAuth();

  // Load Data
  const loadData = async () => {
    const allCourses = await courseService.getAllCourses();
    const allLecturers = await lecturerService.getAllLecturers();
    const allCandidates = await candidateService.getAllCandidates(); 
    const unassigned = allLecturers.filter(
      (lecturer) => !lecturer.lecturerCourses || lecturer.lecturerCourses.length === 0
    );

    setCourses(allCourses);
    setLecturers(unassigned);
    setCandidates(allCandidates);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Function to handle assigning unassigned lecturer to a course
  const handleAssign = async () => {
    if (!selectedCourseID || !selectedLecturerID) {
      toast({
        title: "Please choose a course and a lecturer.",
        status: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      await lecturerService.assignLecturerToCourse(selectedLecturerID, selectedCourseID);
      toast({
        title: "Lecturer assigned.",
        status: "success",
        duration: 3000,
      });
      setTimeout(() => {
        window.location.reload();
      }, 500); 
    } catch (error) {
      toast({
        title: "Assignment failed.",
        description: (error as Error).message,
        status: "error",
        duration: 3000,
      });
    }
  };

  // Function to handle adding a course
  const handleAddCourse = async () => {
    const { code, name, semester } = addCourse;
    if (!code || !name || !semester) {
      toast({
        title: "All fields required to add a course.",
        status: "warning",
        duration: 3000
      });
      return;
    }
    try {
      await courseService.addCourse({ code, name, semester });
      toast({
        title: "Course added.",
        status: "success", duration: 3000
      });
      setAddCourse({ code: "", name: "", semester: "" });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({ title: "Add failed.", description: (error as Error).message, status: "error", duration: 3000 });
    }
  };

  // Function to handle updating a course
  const handleUpdateCourse = async () => {
    if (!editCourseID) {
      toast({
        title: "Select a course to edit.",
        status: "warning",
        duration: 3000
      });
      return;
    }

    const original = courses.find(c => String(c.courseID) === String(editCourseID));
    if (!original) return;

    const updated = {
      code: editCourse.code.trim() || original.code,
      name: editCourse.name.trim() || original.name,
      semester: editCourse.semester.trim() || original.semester
    };

    try {
      await courseService.updateCourse(editCourseID, updated);
      toast({
        title: "Course updated.",
        status: "success",
        duration: 3000
      });
      setEditCourseID(null);
      setEditCourse({ code: "", name: "", semester: "" });
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: "Update failed.",
        description: (error as Error).message,
        status: "error",
        duration: 3000
      });
    }
  };

  // Function to handle deleting a course
  const handleDeleteCourse = async () => {
    if (!deleteCourseID) {
      toast({
        title: "Select a course to delete.",
        status: "warning",
        duration: 3000
      });
      return;
    }
    try {
      await courseService.deleteCourse(deleteCourseID);
      toast({
        title: "Course deleted.",
        status: "success",
        duration: 3000
      });
      setDeleteCourseID(null);
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (error) {
      toast({
        title: "Delete failed.",
        description: (error as Error).message,
        status: "error",
        duration: 3000
      });
    }
  };

  // Function to handle blocking / unblocking login
  const handleToggleBlock = async () => {
    if (!selectedCandidateID) {
      toast({ title: "Select a candidate.", status: "warning", duration: 3000 });
      return;
    }

    const candidate = candidates.find(c => String(c.candidateID) === String(selectedCandidateID));
    if (!candidate) return;

    const userID = Number(candidate.user.userID);

    try {
      if (candidate.user.isBlocked) {
        await candidateService.unblockCandidate(userID);
        toast({ title: "Candidate unblocked.", status: "success", duration: 3000 });
      } else {
        await candidateService.blockCandidate(userID);
        toast({ title: "Candidate blocked.", status: "success", duration: 3000 });
      }
      setTimeout(() => window.location.reload(), 500);
    } catch (error) {
      toast({ title: "Action failed.", description: (error as Error).message, status: "error", duration: 3000 });
    }
  };

  // Toggle block / unblock button
  const selectedCandidate = candidates.find(c => String(c.candidateID) === String(selectedCandidateID));
  const toggleLabel = selectedCandidate?.user.isBlocked ? "Unblock" : "Block";

  if (authLoading) {
    return (
      <Flex height="100vh" justify="center" align="center">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <VStack spacing={8} p={8} align="stretch">
      {/* Assign Lecturer Section */}
      <Box p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading size="lg" mb={4}>Assign Lecturer to Course</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Lecturer</FormLabel>
            <Select
              placeholder={lecturers.length ? "Select lecturer" : "No unassigned lecturers"}
              onChange={(e) => setSelectedLecturerID(Number(e.target.value))}
              value={selectedLecturerID || ""}
              isDisabled={!lecturers.length}
            >
              {lecturers.map((lecturer) => (
                <option key={lecturer.lecturerID} value={lecturer.lecturerID}>
                  {lecturer.user.firstName} {lecturer.user.lastName}
                </option>
              ))}
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Course</FormLabel>
            <Select
              placeholder="Select course"
              onChange={(e) => setSelectedCourseID(Number(e.target.value))}
              value={selectedCourseID || ""}
            >
              {courses.map((course) => (
                <option key={course.courseID} value={course.courseID}>
                  {course.code} - {course.name} ({course.semester})
                </option>
              ))}
            </Select>
          </FormControl>

          <Button colorScheme="red" onClick={handleAssign} isDisabled={!selectedLecturerID || !selectedCourseID}>
            Assign
          </Button>

          {!lecturers.length && (
            <Text fontSize="sm" color="gray.500">All lecturers have been assigned.</Text>
          )}
        </VStack>
      </Box>

      {/* Manage Courses Section */}
      <Flex gap={6} direction={{ base: "column", md: "row" }}>
        {/* Add Course Box */}
        <Box flex={1} p={6} bg="white" borderRadius="md" boxShadow="md">
          <Heading size="lg" mb={4}>Add Course</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Code</FormLabel>
              <Input placeholder="e.g. COSC2077" value={addCourse.code} onChange={(e) => setAddCourse({ ...addCourse, code: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input placeholder="e.g. Data Analysis" value={addCourse.name} onChange={(e) => setAddCourse({ ...addCourse, name: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Semester</FormLabel>
              <Input placeholder="e.g. Semester 2" value={addCourse.semester} onChange={(e) => setAddCourse({ ...addCourse, semester: e.target.value })} />
            </FormControl>
            <Button colorScheme="green" onClick={handleAddCourse}>Add</Button>
          </VStack>
        </Box>

        {/* Edit Course Box */}
        <Box flex={1} p={6} bg="white" borderRadius="md" boxShadow="md">
          <Heading size="lg" mb={4}>Edit Course</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Select Course</FormLabel>
              <Select
                placeholder="Choose course to edit"
                onChange={(e) => {
                  const id = parseInt(e.target.value, 10);
                  setEditCourseID(id);
                  const found = courses.find(c => c.courseID === id);
                  if (found) {
                    setEditCourse({ code: found.code, name: found.name, semester: found.semester });
                  }
                }}
                value={editCourseID !== null ? String(editCourseID) : ""}
              >
                {courses.map((course) => (
                  <option key={course.courseID} value={course.courseID}>
                    {course.code} - {course.name} ({course.semester})
                  </option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel>Code</FormLabel>
              <Input placeholder="Course Code" value={editCourse.code} onChange={(e) => setEditCourse({ ...editCourse, code: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Name</FormLabel>
              <Input placeholder="Course Name" value={editCourse.name} onChange={(e) => setEditCourse({ ...editCourse, name: e.target.value })} />
            </FormControl>
            <FormControl>
              <FormLabel>Semester</FormLabel>
              <Input placeholder="Semester" value={editCourse.semester} onChange={(e) => setEditCourse({ ...editCourse, semester: e.target.value })} />
            </FormControl>
            <Button colorScheme="yellow" onClick={handleUpdateCourse}>Update</Button>
          </VStack>
        </Box>

        {/* Delete Course Box */}
        <Box flex={1} p={6} bg="white" borderRadius="md" boxShadow="md">
          <Heading size="lg" mb={4}>Delete Course</Heading>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Select Course</FormLabel>
              <Select
                placeholder="Choose course to delete"
                onChange={(e) => setDeleteCourseID(Number(e.target.value))}
                value={deleteCourseID ?? ""}
              >
                {courses.map((course) => (
                  <option key={course.courseID} value={course.courseID}>
                    {course.code} - {course.name} ({course.semester})
                  </option>
                ))}
              </Select>
            </FormControl>
            <Button colorScheme="orange" onClick={handleDeleteCourse}>
              Delete
            </Button>
          </VStack>
        </Box>
      </Flex>

      {/* Block/Unblock Candidate Section */}
      <Box p={6} bg="white" borderRadius="md" boxShadow="md">
        <Heading size="lg" mb={4}>Block/Unblock Candidate Login</Heading>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Select Candidate</FormLabel>
            <Select
              placeholder="Choose candidate"
              onChange={(e) => setSelectedCandidateID(Number(e.target.value))}
              value={selectedCandidateID ?? ""}
            >
              {candidates.map((candidate) => (
                <option key={candidate.candidateID} value={candidate.candidateID}>
                  {candidate.user.firstName} {candidate.user.lastName} - {candidate.user.email} {candidate.user.isBlocked ? "(Blocked)" : ""}
                </option>
              ))}
            </Select>
          </FormControl>
          <Button
            colorScheme="red"
            onClick={handleToggleBlock}
            isDisabled={!selectedCandidateID}
          >
            {toggleLabel}
          </Button>
        </VStack>
      </Box>
    </VStack>
  );
}
