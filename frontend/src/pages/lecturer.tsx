import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Head from "next/head";
import { Heading, Box, Text, Button, useToast, FormControl, FormLabel, Input, Select, Table, Thead, Tbody, Tr, Th, Td, TableContainer, SimpleGrid, Spinner, Center, Flex} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { courseService, lecturerService,selectedCandidateService} from "../services/api";
import { Candidate, Course, AppliedCourse } from "../types/types";
import { AxiosError } from "axios";

export default function LecturerPage() {
  const { user, authLoading } = useAuth();
  const toast = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [appliedCourses, setAppliedCourses] = useState<AppliedCourse[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);

  const [searchName, setSearchName] = useState("");
  const [searchSkill, setSearchSkill] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedAvailability, setSelectedAvailability] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [sortOption, setSortOption] = useState("course_asc");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    // Fetch the lecturer's assigned courses to show in filter
    const fetchLecturerCourses = async () => {
      setIsLoading(true);
      try {
        const lecturerCourses = await lecturerService.getCourses(user.userID);
        const detailedCourses = await Promise.all(
          lecturerCourses.map((lc) =>
            courseService.getOneCourse(lc.courseID)
          )
        );
        setCourses(detailedCourses);
      } catch (err) {
        console.error("Failed to fetch lecturer's courses", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLecturerCourses();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    // Fetch candidates using filters that are optional
    const fetchFilteredApplicants = async () => {
      try {
        const data = await lecturerService.getFilteredApplicants(user.userID, {
          courseID: selectedCourse ? parseInt(selectedCourse) : undefined,
          role: selectedRole,
          availability: selectedAvailability,
          skill: searchSkill,
          name: searchName,
          sortBy: sortOption === "course_asc" || sortOption === "course_desc" ? "course" : "availability",
          order: sortOption.endsWith("desc") ? "desc" : "asc"
        });

        const uniqueCandidates = data.map(ac => ac.candidate).filter(Boolean);
        setAppliedCourses(data);
        setFilteredCandidates(uniqueCandidates);
      } catch {
        toast({
          title: "Failed to fetch applicants",
          status: "error",
          duration: 3000,
        });
      }
    };
    fetchFilteredApplicants();
  }, [user, selectedCourse, selectedRole, selectedAvailability, searchSkill, searchName, sortOption, toast]);


  const handleSelectCandidate = async (candidateID: number) => {
    if (!user) return;

    // Create a new candidate-lecturer association along with ranking
    try {
      // Get total no candidates selected to set new rank as +1 of that length
      const currentSelected = await lecturerService.getSelectedCandidates(user.userID);
      const newRank = currentSelected.length + 1;

      await selectedCandidateService.createSelectedCandidate({
        lecturerID: user.userID,
        candidateID,
        preferenceRanking: newRank,
      });
      toast({
        title: "Candidate Selected",
        description: "The candidate has been successfully selected.",
        status: "success",
        duration: 3000,
        position: "bottom",
        containerStyle: { paddingBottom: "4rem" },
      });
    } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        toast({
          title: "Candidate already selected!",
          description: "This candidate has already been selected.",
          status: "warning",
          duration: 3000,
          containerStyle: { paddingBottom: "4rem" },
        });
      } else {
        toast({
          title: "Selection failed",
          description: "An unexpected error occurred.",
          status: "error",
          duration: 3000,
          containerStyle: { paddingBottom: "4rem" },
        });
      }
    }
  };

  // Helper function to format database entries
  function format(input: string): string {
    switch (input) {
      case "lab_assistant":
        return "Lab Assistant";
      case "tutor":
        return "Tutor";
      case "part-time":
        return "Part-time";
      case "full-time":
        return "Full-time"
      default:
        return input.charAt(0).toUpperCase() + input.slice(1); 
    }
  }

  // Helper function to format skills
  function formatSkills(skills: string | undefined): string {
    if (!skills || !skills.trim()) return "N/A";
    return skills
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
      .join(", ");
  }

  if (authLoading) {
    return (
      <Flex height="100vh" justify="center" align="center">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <div className="lecturer-layout">
      <Head>
        <title>Lecturer Page - Applicants</title>
        <meta name="description" content="Lecturer Page - View Applicants" />
      </Head>

      <Sidebar />

      <main className="main">
        <Heading mb={4}>View Applicants</Heading>
        {/* Filter Section */}
        <Box p={6} mb={6} border="1px" borderRadius="sm" bg="#e2e6ea">
          <Heading size="lg" mb={4}>Filter & Sort</Heading>
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input value={searchName} onChange={(e) => setSearchName(e.target.value)} bg="white" />
              </FormControl>
              <FormControl>
                <FormLabel>Skill</FormLabel>
                <Input value={searchSkill} onChange={(e) => setSearchSkill(e.target.value)} bg="white" />
              </FormControl>
              <FormControl>
                <FormLabel>Course</FormLabel>
                <Select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)} bg="white">
                  <option value="">All</option>
                  {courses.map((c) => (
                    <option key={c.courseID} value={c.courseID}>{c.code} - {c.name}</option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Availability</FormLabel>
                <Select value={selectedAvailability} onChange={(e) => setSelectedAvailability(e.target.value)} bg="white">
                  <option value="">Any</option>
                  <option value="part-time">Part-time</option>
                  <option value="full-time">Full-time</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Session</FormLabel>
                <Select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} bg="white">
                  <option value="">Any</option>
                  <option value="lab_assistant">Lab</option>
                  <option value="tutor">Tutorial</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Sort By</FormLabel>
                <Select value={sortOption} onChange={(e) => setSortOption(e.target.value)} bg="white">
                  <option value="course_asc">Course (A-Z)</option>
                  <option value="course_desc">Course (Z-A)</option>
                  <option value="availability_asc">Availability (A-Z)</option>
                  <option value="availability_desc">Availability (Z-A)</option>
                </Select>
              </FormControl>
            </SimpleGrid>
          </Box>
        
          {/* Candidates */}
          <Box width="100%" display="flex" justifyContent="center">
            <Box width="100%" maxW="1200px" overflowX="auto">
            {isLoading ? (
              <Center py={8}>
                <Spinner size="xl" thickness="4px" speed="0.65s" color="red.500" />
              </Center>
              ) : filteredCandidates.length > 0 ? (
              <TableContainer>
                <Table variant="striped" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Previous Roles</Th>
                      <Th>Availability</Th>
                      <Th>Skills</Th>
                      <Th>Academic Credentials</Th>
                      <Th>Applied Course</Th>
                      <Th>Applied Role</Th>
                      <Th textAlign="center">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCandidates.map((candidate) => {
                      const applied = appliedCourses.filter(
                        (ac) => ac.candidate?.candidateID === candidate.candidateID
                      );

                      return (
                        <Tr key={candidate.candidateID}>
                          <Td>{candidate.user.firstName} {candidate.user.lastName}</Td>
                          <Td whiteSpace="normal" maxW="150px" wordBreak="break-word">{candidate.previousRoles || "N/A"}</Td>
                          <Td whiteSpace="normal" maxW="150px" wordBreak="break-word">{format(candidate.availability)}</Td>
                          <Td whiteSpace="normal" maxW="150px" wordBreak="break-word">{formatSkills(candidate.skills)}</Td>
                          <Td whiteSpace="normal" maxW="150px" wordBreak="break-word">{candidate.academicCredentials || "N/A"}</Td>
                          <Td whiteSpace="normal" maxW="150px" wordBreak="break-word">
                            {applied.map((ac, i) => {
                              const course = courses.find(c => c.courseID === ac.courseID);
                              return (
                                <Text key={i}>
                                  {course ? `${course.code} - ${course.name} (${course.semester})` : "Unknown"}
                                </Text>
                              );
                            })}
                          </Td>
                          <Td whiteSpace="normal" maxW="150px" wordBreak="break-word">
                            {applied.map((ac, i) => (
                              <Text key={i}>{format(ac.role)}</Text>
                            ))}
                          </Td>
                          <Td textAlign="center">
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleSelectCandidate(candidate.candidateID)}
                            >
                              Select
                            </Button>
                          </Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
              </TableContainer>
            ) : (
              <Text pt={4} fontWeight="bold">No applicants available.</Text>
            )}
            </Box>
          </Box>
      </main>
      <Footer />
    </div>
  );
}
