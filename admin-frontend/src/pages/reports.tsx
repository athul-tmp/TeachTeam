import { Box, Heading, Button, VStack, Table, Thead, Tr, Th, Tbody, Td, Divider } from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import { courseService, candidateService, CourseWithSelectedCandidates, Candidate } from "../services/api";
import { useRouter } from "next/router";

export default function Reports() {
  const [coursesWithCandidates, setCoursesWithCandidates] = useState<CourseWithSelectedCandidates[]>([]);
  const [moreThanThree, setMoreThanThree] = useState<Candidate[]>([]);
  const [noSelections, setNoSelections] = useState<Candidate[]>([]);
  const router = useRouter();

  // Load Data
  const loadData = async () => {
    const coursesAndSelectedCandidates = await courseService.getCoursesWithSelectedCandidates();
    const candidatesWithMoreThanThreeSelections = await candidateService.getCandidatesWithMoreThanThreeSelections();
    const candidatesWithNoSelections = await candidateService.getCandidatesWithNoSelections();

    setCoursesWithCandidates(coursesAndSelectedCandidates);
    setMoreThanThree(candidatesWithMoreThanThreeSelections);
    setNoSelections(candidatesWithNoSelections);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <Box p={8} m={8} bg="gray.100" borderRadius="md" boxShadow="md">
      <Button leftIcon={<ArrowLeftIcon />} mb={6} colorScheme="red" onClick={() => router.push("/dashboard")}>
        Back to Dashboard
      </Button>
      <Box p={5} minW={1000} bg="white" borderRadius="md" boxShadow="md" mb={10}>
        <Heading size="2xl" textAlign="center">Candidate Report</Heading>
      </Box>
      
      <VStack spacing={10} align="stretch">
        <Box p={6} minW={1000} bg="white" borderRadius="md" boxShadow="md">
          <Heading size="lg" textAlign="center" mb={5}>Candidates Chosen for Each Course</Heading>
          <Divider mb={5} />
          {coursesWithCandidates.map(course => (
            <Box key={course.courseID} mb={6}>
              <Heading size="md" mb={2}>{course.code} - {course.name} ({course.semester})</Heading>
                <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th>First Name</Th>
                    <Th>Last Name</Th>
                    <Th>Email</Th>
                    <Th>Login Blocked</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {course.selectedCandidates.map((c) => (
                    <Tr key={c.candidateID}>
                      <Td>{c.user.firstName}</Td>
                      <Td>{c.user.lastName}</Td>
                      <Td>{c.user.email}</Td>
                      <Td>{c.user.isBlocked ? "Yes" : "No"}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ))}
        </Box>

        <Box p={6} bg="white" borderRadius="md" boxShadow="md">
          <Heading size="lg" textAlign="center" mb={5}>Candidates Chosen for More Than 3 Courses</Heading>
          <Divider mb={5} />
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>First Name</Th>
                  <Th>Last Name</Th>
                  <Th>Email</Th>
                  <Th>Login Blocked</Th>
                </Tr>
              </Thead>
              <Tbody>
                {moreThanThree.map((c) => (
                  <Tr key={c.candidateID}>
                    <Td>{c.user.firstName}</Td>
                    <Td>{c.user.lastName}</Td>
                    <Td>{c.user.email}</Td>
                    <Td>{c.user.isBlocked ? "Yes" : "No"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
        </Box>

        <Box p={6} bg="white" borderRadius="md" boxShadow="md">
          <Heading size="lg" textAlign="center" mb={5}>Candidates Not Chosen for Any Course</Heading>
          <Divider mb={5} />
            <Table variant="striped">
              <Thead>
                <Tr>
                  <Th>First Name</Th>
                  <Th>Last Name</Th>
                  <Th>Email</Th>
                  <Th>Login Blocked</Th>
                </Tr>
              </Thead>
              <Tbody>
                {noSelections.map((c) => (
                  <Tr key={c.candidateID}>
                    <Td>{c.user.firstName}</Td>
                    <Td>{c.user.lastName}</Td>
                    <Td>{c.user.email}</Td>
                    <Td>{c.user.isBlocked ? "Yes" : "No"}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
        </Box>
      </VStack>
    </Box>
  );
}
