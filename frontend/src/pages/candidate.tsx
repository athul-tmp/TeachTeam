import { useEffect, useState } from "react";
import Head from "next/head";
import {Box,Heading,FormControl,FormLabel,Select,Button,Flex,Input,Wrap,WrapItem,Tag,TagLabel,TagCloseButton,Text,useToast,Spinner} from "@chakra-ui/react";
import Footer from "../components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Candidate, Course, AppliedCourse } from "../types/types";
import { courseService, candidateService, appliedCourseService } from "../services/api";

export default function CandidatePage() {
  const toast = useToast();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [appliedCourses, setAppliedCourses] = useState<AppliedCourse[]>([]);
  const [selectedRole, setSelectedRole] = useState<"tutor" | "lab_assistant">("tutor");
  const [selectedAvailability, setSelectedAvailability] = useState<"part-time" | "full-time">("part-time");
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [AppliedCourse , setAppliedCourse ] = useState<AppliedCourse  | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<"Semester 1" | "Semester 2">("Semester 1");
  const [selectedCourse, setSelectedCourse] = useState<number | "">("");
  const [addRole, setAddRole] = useState("");
  const [addSkill, setAddSkill] = useState("");
  const [addCred, setAddCred] = useState("");

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.userID) return;

    (async () => {
      try {
        setIsLoading(true);
        const cand = await candidateService.getOneCandidate(user.userID);
        if (!cand) {
          toast({
            title: "Candidate not found!",
            description: "Please sign in again.",
            status: "error",
            duration: 3000,
            containerStyle: { paddingBottom: "4rem" },
          });
          return;
        }
        setCandidate(cand);
        setSelectedAvailability(cand.availability || "part-time");
      

        // Load all courses
        const crs = await courseService.getAllCourses();
        setCourses(crs);

        // Load applied courses for candidate
        const applied = await candidateService.getAppliedCourses(cand.candidateID);
        setAppliedCourses(applied);
      } catch {
        toast({
          title: "Failed to load data!",
          description: "Please try again later.",
          status: "error",
          duration: 3000,
          containerStyle: { paddingBottom: "4rem" },
        });
      } finally {
        setIsLoading(false);
      }
    })();
  }, [user?.userID, toast]);

  // Refresh applied courses list
  async function refreshApplied() {
    if (!candidate) return;
    try {
      const applied = await candidateService.getAppliedCourses(candidate.candidateID);
      setAppliedCourses(applied);
    } catch {
      toast({ title: "Failed to refresh applied courses", status: "error" });
    }
  }

  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  // Update candidate availability
  async function handleAvailability() {
    if (!candidate) return;
    if (selectedAvailability === candidate.availability) {
      toast({
        title: "You've already chosen this availability.",
        status: "warning",
      });
      return;
    }

    try {
      setIsUpdatingAvailability(true);
      await candidateService.updateCandidate(candidate.candidateID, {
        availability: selectedAvailability,
      });
      setCandidate({ ...candidate, availability: selectedAvailability });
      toast({ title: "Availability updated", status: "success" });
    } catch {
      toast({ title: "Failed to update availability", status: "error" });
    } finally {
      setIsUpdatingAvailability(false);
    }
  }

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleChange() {
    if (!candidate || !selectedCourse || !selectedRole || !selectedSemester) {
      toast({ title: "Missing information", status: "error" });
      return;
    }

    try {
      setIsSubmitting(true);
      // If an application already exists, delete (the old course-role entry)
      if (AppliedCourse) {
        await appliedCourseService.deleteAppliedCourse(
          AppliedCourse.candidateID,
          AppliedCourse.courseID,
          AppliedCourse.role
        );
      }
      //  new applied course with updated course and role 
      const result = await appliedCourseService.createAppliedCourse({
        candidateID: candidate.candidateID,
        courseID: selectedCourse,
        role: selectedRole
      });

      await refreshApplied();
      setAppliedCourse(result);

      toast({ title: "Course application updated!", status: "success" });
    } catch (error) {
      console.error("handleChange error:", error);
      toast({ title: "Error updating course application", status: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const [loadingField, setLoadingField] = useState<null | "previousRoles" | "skills" | "academicCredentials">(null);
  // (role, skill, credential)
  async function addItem(field: "previousRoles" | "skills" | "academicCredentials", value: string, reset: () => void){
    if (!candidate) return;

    if (!value.trim()) {
      toast({
        title: "Please enter a value before adding.",
        status: "warning",
      });
      return;
    }

    const existing = candidate[field] || "";
    const items = existing.split(",").map((item) => item.trim()).filter((item) => item.length > 0);
      
    if (items.includes(value.trim())) {
      toast({
        title: `"${value}" already exists in ${formatFieldName(field)}.`,
        status: "info",
      });
      return;
    }

    const updated = [...items, value.trim()].join(",");

    try {
      setLoadingField(field);
      await candidateService.updateCandidate(candidate.candidateID, {
        [field]: updated,
      });

      const newCandidate = await candidateService.getOneCandidate(candidate.candidateID);
      setCandidate(newCandidate);

      reset();
      toast({
        title: `Added "${value}" to ${formatFieldName(field)}.`,
        status: "success",
      });
    } catch {
      toast({
        title: `Failed to add "${value}" to ${formatFieldName(field)}.`,
        status: "error",
      });
    } finally {
      setLoadingField(null);
    }
  }

  function formatFieldName(field: "previousRoles" | "skills" | "academicCredentials"): string {
    switch (field) {
      case "previousRoles":
        return "roles";
      case "skills":
        return "skills";
      case "academicCredentials":
        return "credentials";
      default:
        return field;
    }
  }

  // Handlers for adding/removing roles, skills, credentials

  function handleAddRole() {
    addItem("previousRoles", addRole, () => setAddRole(""));
  }

  const handleRemoveRole = async (roleToRemove: string) => {
    if (!candidate) return;

    const rolesArray = candidate.previousRoles
      ? candidate.previousRoles.split(",").map(r => r.trim())
      : [];

    const updatedRolesArray = rolesArray.filter(role => role !== roleToRemove);
    const updatedRoles = updatedRolesArray.join(",");

    try {
      const savedCandidate = await candidateService.updateCandidate(candidate.candidateID, {
        previousRoles: updatedRoles || "",
      });
      setCandidate(savedCandidate);
      toast({ title: `Removed role: "${roleToRemove}"`, status: "success" })
    } catch (error) {
      console.error("Failed to update candidate:", error);
    }
  }

  function handleAddSkill() {
    addItem("skills", addSkill, () => setAddSkill(""));
  }

  const handleRemoveSkill =  async (skillToRemove: string) => {
    if (!candidate) return;

    const skillsArray = candidate.skills
      ? candidate.skills.split(",").map(s => s.trim())
      : [];

    const updatedskillsArray = skillsArray.filter(skill => skill !== skillToRemove);
    const updatedSkills = updatedskillsArray.join(",");

    try {
      const savedCandidate = await candidateService.updateCandidate(candidate.candidateID, {
        skills: updatedSkills || "",
      });
      setCandidate(savedCandidate);
      toast({ title: `Removed skill: "${skillToRemove}"`, status: "success" })
    } catch (error) {
      console.error("Failed to update candidate:", error);
    }
  };

  function handleAddCredential(addCred: string) {
    addItem("academicCredentials", addCred, () => setAddCred(""));
  };


  const handleRemoveCredential =  async (credToremove: string) => {
    if (!candidate) return;

    const credsArray = candidate.academicCredentials
      ? candidate.academicCredentials.split(",").map(c => c.trim())
      : [];

    const updatedCredsArray = credsArray.filter(cred => cred !== credToremove);
    const updatedCreds = updatedCredsArray.join(",");

    try {
      const savedCandidate = await candidateService.updateCandidate(candidate.candidateID, {
        academicCredentials: updatedCreds|| "",
      });
      setCandidate(savedCandidate);
      toast({ title: `Removed academic credential: "${credToremove}"`, status: "success" })
    } catch (error) {
      console.error("Failed to update candidate:", error);
    };
  }

  function formatAvailability(value?: string) {
    return value === "part-time" ? "Part-time" :
          value === "full-time" ? "Full-time" : "Unavailable";
  }

  if (isLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <div>
      <Head>
        <title>Candidate Page</title>
      </Head>
      <main>
      {/* Apply Section */}
      <Box p={4} border="1px" borderRadius="md" maxW="800px" mx="auto" mt={6}>
        <Heading size="xl" textAlign="center" mb={4}>
          Apply for Tutor / Lab Assistant Role
        </Heading>
        

        <Flex justify="center" gap="20px">
          <FormControl>
            <FormLabel textAlign="center">Select Semester</FormLabel>
            <Select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as "Semester 1" | "Semester 2")}
              mb={4}
            >
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </Select>
          </FormControl>

          <FormControl>
            <FormLabel textAlign="center">Select Course</FormLabel>
              <Select
                placeholder="Select a course"
                value={selectedCourse}
                onChange={(e) => {
                  const courseID = parseInt(e.target.value);
                  setSelectedCourse(isNaN(courseID) ? "" : courseID);
                  const existing = appliedCourses.find(ac => ac.courseID === courseID);
                  setAppliedCourse(existing || null);
                }}
              >
                {courses
                  .filter((c) => c.semester === selectedSemester)
                  .map((c) => (
                    <option key={c.courseID} value={c.courseID}>
                      {c.code} - {c.name}
                    </option>
                  ))}
              </Select>
          </FormControl>
        </Flex>
        <FormControl mb={5}>
          <FormLabel textAlign="center">Select Role</FormLabel >
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as "tutor" | "lab_assistant")}
            mb={4}
          >
            <option value="tutor">Tutor</option>
            <option value="lab_assistant">Lab Assistant</option>
          </Select>
        </FormControl>

        <Flex justify="center">
          <Button isLoading={isSubmitting} colorScheme="red" minW="100px" onClick={handleChange}>
            Apply
          </Button>
        </Flex>
      </Box>

      {/* Availability Section */}
      <Box p={6} border="1px" borderRadius="md" maxW="800px" mx="auto" mt={10}>
        <Heading size="lg" textAlign="center" mb={2}>
          Availability
        </Heading>

        <Text textAlign="center" mb={2}>
          Current: {formatAvailability(candidate?.availability)}
        </Text>
        <FormControl mb={5}>          
          <Select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value as "part-time" | "full-time")}
          >
            <option value="part-time">Part-time</option>
            <option value="full-time">Full-time</option>
          </Select>
        </FormControl>

        <Flex justify="center">
          <Button onClick={handleAvailability} isLoading={isUpdatingAvailability} colorScheme="red" minW="100px">
            Update
          </Button>
        </Flex>
      </Box>
      
      {/* Previous Roles */}
      <Box p={4} border="1px" borderRadius="md" maxW="800px" mx="auto" mt={20}>
        <Heading size="lg" textAlign="center" paddingBottom={5}>
          Previous Roles
        </Heading>
        {candidate?.previousRoles?.trim() ? (
          <Wrap>
            {candidate.previousRoles.split(",").map((role) => (
              <WrapItem key={role}>
                <Tag size="lg" colorScheme="blue">
                  <TagLabel>{role.trim()}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveRole(role.trim())} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          <Text textAlign="center" color="gray.600" fontStyle="italic">
            No previous roles
          </Text>
        )}

        <FormControl mt={5}>
          <FormLabel fontSize="lg">Add Previous Role:</FormLabel>
          <Input 
            placeholder="Add new previous role" 
            value={addRole} 
            onChange={(e) => setAddRole(e.target.value)} 
          />
        </FormControl>

        <Flex justify="center" mt={4}>
          <Button colorScheme="red" minW="100px" onClick={handleAddRole} isLoading={loadingField === "previousRoles"}>
            Add
          </Button>
        </Flex>
      </Box>

      {/* Skills */}
      <Box p={4} border="1px" borderRadius="md" maxW="800px" mx="auto" mt={20}>
        <Heading size="lg" textAlign="center" paddingBottom={5}>Skills</Heading>
        {candidate?.skills?.trim() ? (
          <Wrap>
            {candidate.skills.split(",").map((skill, index) => (
              <WrapItem key={index}>
                <Tag size="lg" colorScheme="red">
                  <TagLabel>{skill.trim()}</TagLabel>
                  <TagCloseButton onClick={() => handleRemoveSkill(skill.trim())} />
                </Tag>
              </WrapItem>
            ))}
          </Wrap>
        ) : (
          <Text textAlign="center" color="gray.600" fontStyle="italic">
            No Skills Available
          </Text>
        )}

        <FormControl mt={5}>
        <FormLabel fontSize="lg">Add Skill:</FormLabel>
          <Input 
            placeholder="Add new skill" 
            value={addSkill} 
            onChange={(e) => setAddSkill(e.target.value)} 
          />
        </FormControl>

        <Flex justify="center" mt={4}>
          <Button colorScheme="red" minW="100px" onClick={handleAddSkill} isLoading={loadingField === "skills"}>
            Add
          </Button>
        </Flex>
      </Box>
  
      {/* Academic Credentials */}
      <Box p={4} border="1px" borderRadius="md" maxW="800px" mx="auto"   mt={20} mb={5}>
        <Heading size="lg" textAlign="center" paddingBottom="5">Academic Credentials</Heading>
        {candidate?.academicCredentials?.trim() ? (
          <Wrap>
              {candidate?.academicCredentials?.split(',').map((cred, index) => (
            <WrapItem key={index}>
              <Tag size="lg" colorScheme="orange">
                <TagLabel>{cred.trim()}</TagLabel>
              <TagCloseButton onClick={() => handleRemoveCredential(cred)} />
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
        ) : (
          <Text textAlign="center" color="gray.600" fontStyle="italic">No Academic Credentials Available</Text>
        )}
        <FormControl mt={5}>
          <FormLabel fontSize="lg">Add Academic Credential:</FormLabel>
          <Input
            placeholder="Add new academic credential"
            value={addCred}
            onChange={(e) => setAddCred(e.target.value)}
          />
        </FormControl>
        <Flex justify="center" mt={4}>
          <Button colorScheme="red" minW="100px" onClick={() => handleAddCredential(addCred)} isLoading={loadingField === "academicCredentials"}>
           Add
          </Button>
        </Flex>
      </Box>
      </main>
      <Footer />
    </div>
  )
}
