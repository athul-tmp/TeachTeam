import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import Head from "next/head";
import { Box, Button, Flex, FormControl, Heading, Text, useToast, Select, FormLabel, Input, Spinner, Center } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";
import { useAuth } from "../context/AuthContext";
import {lecturerService, candidateService, selectedCandidateService, commentService} from "../services/api";
import { Candidate, SelectedCandidate, Comment, AppliedCourse } from "../types/types";

export default function LecturerManage() {
  const { user } = useAuth();
  const toast = useToast();

  const [selectedCandidates, setSelectedCandidates] = useState<SelectedCandidate[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [newComments, setNewComments] = useState<{ [candidateID: number]: string }>({});
  const [appliedCourses, setAppliedCourses] = useState<{ [candidateID: number]: AppliedCourse[] }>({});
  const [lecturerCourses, setLecturerCourses] = useState<number[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch the lecturer's data
        const lecturer = await lecturerService.getOneLecturer(user.userID);
        // Store lecturer's selected candidates ids and preference
        setSelectedCandidates(lecturer.selectedCandidates ?? []);

        // Store lecturer's taught courses
        setLecturerCourses((lecturer.lecturerCourses ?? []).map(lc => lc.courseID));

        // Fetch and store all comments made on these selected candidates
        const allCandidateIDs = (lecturer.selectedCandidates ?? []).map((sc) => sc.candidateID);

        const allComments: Comment[] = [];
        for (const id of allCandidateIDs) {
          const candidateComments = await commentService.getCommentsForCandidate(id);
          allComments.push(...candidateComments);
        }

        console.log(allComments);
        const linkedComments = allComments.map((comment: Comment) => ({
          ...comment,
          candidateID: comment.candidate?.candidateID ?? comment.candidateID ?? "",
        }));

        setComments(linkedComments);

        // Fetch and store candidate information
        const fetchedCandidates = await Promise.all((lecturer.selectedCandidates ?? []).map((sc: SelectedCandidate) => candidateService.getOneCandidate(sc.candidateID)));
        setCandidates(fetchedCandidates);

        // Fetch and store courses applied for by candidates
        const fetchedCoursesMap: { [candidateID: number]: AppliedCourse[] } = {};
        for (const candidate of fetchedCandidates) {
          const apps = await candidateService.getAppliedCourses(candidate.candidateID);
          fetchedCoursesMap[candidate.candidateID] = apps;
        }
        setAppliedCourses(fetchedCoursesMap);

      } catch {
        toast({
          title: "Error loading data",
          status: "error",
          duration: 3000,
          containerStyle: { paddingBottom: '4rem' }
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, toast]);

  // Function to get ranks
  const getRank = (candidateID: number) => {
    return selectedCandidates.find((sc) => sc.candidateID === candidateID)?.preferenceRanking || 1;
  };

  const handleRankingChange = async (candidateID: number, newRank: number) => {
    try {
      const currentCandidate = selectedCandidates.find(sc => sc.candidateID === candidateID);
      const previousRank = currentCandidate?.preferenceRanking;

      if (!previousRank) return;

      const conflictingCandidate = selectedCandidates.find(
        sc => sc.preferenceRanking === newRank
      );

      // Update current candidate to newRank
      await selectedCandidateService.updateSelectedCandidate(user!.userID, candidateID, {
        preferenceRanking: newRank,
      });

      // Update conflicting candidate to previousRank
      if (conflictingCandidate) {
        await selectedCandidateService.updateSelectedCandidate(user!.userID, conflictingCandidate.candidateID, {
          preferenceRanking: previousRank,
        });
      }

      // Update state
      const updated = selectedCandidates.map((sc) => {
        if (sc.candidateID === candidateID) {
          return { ...sc, preferenceRanking: newRank };
        } else if (conflictingCandidate && sc.candidateID === conflictingCandidate.candidateID) {
          return { ...sc, preferenceRanking: previousRank };
        }
        return sc;
      });

      setSelectedCandidates(updated);

      toast({
        title: "Ranking Updated!",
        description: `Updated ranking successfully.`,
        status: "success",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
    } catch {
      toast({
        title: "Failed to update ranking",
        status: "error",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
    }
  };

  // Remove selected candidate
  const handleRemoveCandidate = async (candidateID: number) => {
    try {
      await selectedCandidateService.deleteSelectedCandidate(user!.userID, candidateID);

      const updatedSelected = selectedCandidates.filter((sc) => sc.candidateID !== candidateID);
      const updatedCandidates = candidates.filter((c) => c.candidateID !== candidateID);

      setSelectedCandidates(updatedSelected);
      setCandidates(updatedCandidates); 

      toast({
        title: "Candidate Successfully Removed!",
        description: "The candidate has been removed!",
        status: "success",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
    } catch {
      toast({
        title: "Failed to remove candidate",
        status: "error",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
    }
  };

  const handleCommentChange = async (candidateID: number, content: string) => {
    if (!user) return;
    if (!content) {
      toast({
        title: "Comment cannot be empty",
        description: "Please enter text before submitting your comment.",
        status: "warning",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
      return;
    }

    const newCmt: Omit<Comment, "commentID"> = {
      content,
      createdAt: new Date().toISOString(),
      candidateID,
      lecturerID: user.userID,
    };

    // Create a new comment and add it with the rest
    try {
      const savedComment = await commentService.createComment(newCmt);

      const addComment = {
        ...savedComment,
        candidateID: savedComment.candidate?.candidateID ?? savedComment.candidateID ?? "",
      };

      setComments([...comments, addComment]);

      setNewComments((prev) => ({ ...prev, [candidateID]: "" }));

      toast({
        title: "Comment Added!",
        description: "Your comment has been added successfully.",
        status: "success",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
    } catch {
      toast({
        title: "Failed to add comment",
        status: "error",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
    }
  };

  const handleCommentDelete = async (commentID: number) => {
    // Delete selected comment
    try {
      await commentService.deleteComment(commentID);
      const updated = comments.filter((c) => c.commentID !== commentID);
      setComments(updated);

      toast({
        title: "Comment Deleted!",
        description: "Your comment has been deleted successfully.",
        status: "success",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
    } catch {
      toast({
        title: "Failed to delete comment",
        status: "error",
        duration: 3000,
        containerStyle: { paddingBottom: '4rem' }
      });
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

  return (
    <div className="lecturer-layout">
      <Head>
        <title>Manage Selected Candidates</title>
        <meta name="description" content="Manage Selected Candidates" />
      </Head>

      <Sidebar />

      <main className="main">
        <Heading>Manage Selected Candidates</Heading>
        <Box p={6} border="1px" borderRadius="sm" mx="auto" my="5">
          {/* It render each selected candidate individually */}
          {isLoading ? (
            <Center py={10}>
              <Spinner size="xl" thickness="4px" speed="0.65s" color="red.500" />
            </Center>
          ):candidates.length > 0 ? (
            candidates.map((candidate) => (
              <Box key={candidate.candidateID} p={6} border="1px" borderRadius="md" mx="auto" my="5">
                <Text>
                  <strong>Name:</strong> {candidate.user.firstName} {candidate.user.lastName}
                </Text>
                <Text>
                  <strong>Availability:</strong> {format(candidate.availability)}
                </Text>
                <Text>
                  <strong>Skills:</strong> {formatSkills(candidate.skills)}
                </Text>
                {/* Show the courses applied by the candidate that the lecturer teaches */}
                {(appliedCourses[candidate.candidateID] || [])
                  .filter(ac => lecturerCourses.includes(ac.courseID)) 
                  .map((ac, idx) => (
                    <Text key={idx}>
                      <strong>Applied Course:</strong> {ac.course?.code} - {ac.course?.name} ({ac.course?.semester})
                    </Text>
                ))}
                {/* Show the role applied by the candidate for the course */}
                {(appliedCourses[candidate.candidateID] || [])
                  .filter(ac => lecturerCourses.includes(ac.courseID)) 
                  .map((ac, idx) => (
                    <Text key={idx}>
                      <strong>Applied Role:</strong> {format(ac.role)}
                    </Text>
                ))}
                <Text>
                  <strong>Preference Rank:</strong>
                </Text>
                <Select
                  value={getRank(candidate.candidateID)}
                  onChange={(e) => handleRankingChange(candidate.candidateID, parseInt(e.target.value))}
                  width="100px"
                  mb={4}
                >
                  {[...Array(candidates.length)].map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </Select>

                <Flex justify="center">
                  <Button colorScheme="red" onClick={() => handleRemoveCandidate(candidate.candidateID)}>
                    Remove Candidate
                  </Button>
                </Flex>

                <Heading size="s" mt="20px">Comments</Heading>
                <Box background="#e2e6ea" p={4} borderRadius="md" mt={2}>
                  {comments.filter((c) => c.candidateID === candidate.candidateID).length === 0 ? (
                    <Text>No comments yet.</Text>
                  ) : (
                    comments
                      .filter((c) => c.candidateID === candidate.candidateID)
                      .map((comment) => (
                        <Box key={comment.commentID} bg="white" p={3} my={2} borderRadius="md" border="1px">
                          <Flex justify="space-between" align="center">
                            <Text>{comment.content}</Text>
                            {comment.lecturer?.lecturerID === user?.userID && (
                              <CloseIcon
                                boxSize={5}
                                color="red.500"
                                cursor="pointer"
                                background={"red.200"}
                                borderRadius="full"
                                p={1}
                                _hover={{ background: "red.300" }}
                                onClick={() => handleCommentDelete(comment.commentID)}
                              />
                            )}
                          </Flex>
                          <Text fontSize="sm" color="gray.500">
                            {comment.lecturer?.user?.firstName} {comment.lecturer?.user?.lastName} commented on {new Date(comment.createdAt).toLocaleDateString()}
                          </Text>
                        </Box>
                      ))
                  )}
                  <FormControl mt={4}>
                    <FormLabel>Enter Comment:</FormLabel>
                    <Input
                      value={newComments[candidate.candidateID] || ""}
                      onChange={(e) =>
                        setNewComments({...newComments,[candidate.candidateID]: e.target.value,})
                      }
                      placeholder="Comment"
                      bg="white"
                    />
                    <Button
                      mt={2}
                      colorScheme="red"
                      onClick={() => handleCommentChange(candidate.candidateID, newComments[candidate.candidateID] || "")}
                    >
                      Submit
                    </Button>
                  </FormControl>
                </Box>
              </Box>
            ))
          ) : (
            <Text pt={4} className="font-bold">
              No candidates selected yet!
            </Text>
          )}
        </Box>
      </main>
      <Footer />
    </div>
  );
}
