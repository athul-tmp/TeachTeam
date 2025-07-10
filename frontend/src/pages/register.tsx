import {
  Box,
  Button,
  VStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Select,
  useToast,
  FormErrorMessage
} from "@chakra-ui/react";
import { ArrowLeftIcon } from "@chakra-ui/icons";
import Link from "next/link";
import Footer from "../components/Footer";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { userService } from "../services/api";
import { AxiosError } from "axios";

export default function RegisterPage() {
  const [firstname, setFirstName] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"candidate" | "lecturer" | "">("");
  const [validationErrors, setValidationErrors] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: ""
  });

  const router = useRouter();
  const toast = useToast();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatePassword = (password: string) => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const isLongEnough = password.length >= 8;
    return hasUpperCase && hasLowerCase && hasNumber && isLongEnough;
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (!validateEmail(value)) {
      setValidationErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setValidationErrors(prev => ({ ...prev, email: "" }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (!validatePassword(value)) {
      setValidationErrors(prev => ({
        ...prev,
        password: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number"
      }));
    } else {
      setValidationErrors(prev => ({ ...prev, password: "" }));
    }

    if (confirmPassword && value !== confirmPassword) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    if (password && value !== password) {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "Passwords do not match" }));
    } else {
      setValidationErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: ""
    });

    if (!firstname.trim()) {
      setValidationErrors(prev => ({ ...prev, firstname: "Please enter your First name" }));
      return;
    }

    if (!lastname.trim()) {
      setValidationErrors(prev => ({ ...prev, lastname: "Please enter your Last name" }));
      return;
    }

    if (!validateEmail(email)) {
      setValidationErrors(prev => ({ ...prev, email: "Please enter a valid email address" }));
      return;
    }

    if (!validatePassword(password)) {
      setValidationErrors(prev => ({
        ...prev,
        password: "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number"
      }));
      return;
    }

    if (password !== confirmPassword) {
      setValidationErrors(prev => ({
        ...prev,
        confirmPassword: "Passwords do not match"
      }));
      return;
    }

    if (!role) {
      setValidationErrors(prev => ({ ...prev, role: "Please select a role" }));
      return;
    }

    try {
      await userService.createUser({ firstName: firstname, lastName: lastname, email, password, role });
      toast({
        title: "Registration Successful!",
        description: "Your account has been created! Please sign in.",
        status: "success",
        duration: 3000,
        position: "bottom",
        containerStyle: { paddingBottom: "4rem" }
      });
      router.push("/login");
        } catch (error) {
      if (error instanceof AxiosError && error.response?.status === 409) {
        setValidationErrors(prev => ({ ...prev, email: "Email is already in use" }));
      } else {
        toast({
          title: "Registration failed",
          description: "Something went wrong. Please try again.",
          status: "error",
          duration: 3000,
          position: "bottom",
          containerStyle: { paddingBottom: "4rem" }
        });
      }
    }
  };

  return (
    <div>
      <Head>
        <title>Register</title>
        <meta name="description" content="Register to TeachTeam" />
      </Head>

      <main className="main">
        <Box p={8} maxW="500px" mx="auto" border="1px" borderRadius="md" mt="4vh">
          <Link href="/">
            <Button leftIcon={<ArrowLeftIcon />} colorScheme="red">
              Back
            </Button>
          </Link>
          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <Heading textAlign="center" paddingTop="5" fontSize="38px">Sign Up</Heading>

              <FormControl isRequired isInvalid={!!validationErrors.firstname}>
                <FormLabel>First Name</FormLabel>
                <Input value={firstname} onChange={(e) => setFirstName(e.target.value)} placeholder="Enter your first name" />
                <FormErrorMessage>{validationErrors.firstname}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!validationErrors.lastname}>
                <FormLabel>Last Name</FormLabel>
                <Input value={lastname} onChange={(e) => setLastName(e.target.value)} placeholder="Enter your last name" />
                <FormErrorMessage>{validationErrors.lastname}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!validationErrors.email}>
                <FormLabel>Email</FormLabel>
                <Input type="email" value={email} onChange={(e) => handleEmailChange(e.target.value)} placeholder="Enter your email" />
                <FormErrorMessage>{validationErrors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!validationErrors.password}>
                <FormLabel>Password</FormLabel>
                <Input type="password" value={password} onChange={(e) => handlePasswordChange(e.target.value)} placeholder="Enter your password" />
                <FormErrorMessage>{validationErrors.password}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!validationErrors.confirmPassword}>
                <FormLabel>Confirm Password</FormLabel>
                <Input type="password" value={confirmPassword} onChange={(e) => handleConfirmPasswordChange(e.target.value)} placeholder="Confirm your password" />
                <FormErrorMessage>{validationErrors.confirmPassword}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired isInvalid={!!validationErrors.role}>
                <FormLabel>Role</FormLabel>
                <Select placeholder="Select role" value={role} onChange={(e) => setRole(e.target.value as "candidate" | "lecturer")}>
                  <option value="candidate">Candidate</option>
                  <option value="lecturer">Lecturer</option>
                </Select>
                <FormErrorMessage>{validationErrors.role}</FormErrorMessage>
              </FormControl>

              <Button type="submit" colorScheme="red" width="100%" mt={5}>Sign up</Button>
            </VStack>
          </form>
        </Box>
      </main>
      <Footer />
    </div>
  );
}
