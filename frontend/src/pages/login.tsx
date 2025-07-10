import {
    Box,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    VStack,
    Heading,
    useToast
  } from "@chakra-ui/react";
import { ArrowLeftIcon } from '@chakra-ui/icons'
import Link from "next/link";
import Footer from "../components/Footer";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/router";
import Head from "next/head";
/*
Reference: The main logic for login and form validation is based on the provided Week 4 tutorial code.
*/
export default function Loginpage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [authError, setAuthError] = useState("");
    const [validationErrors, setValidationErrors] = useState({
        email: "",
        password: "",
      });
    const { login } = useAuth();
    const router = useRouter();
    const toast = useToast();

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

    const validatePassword = (password: string) => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);
        const isLongEnough = password.length >= 8;

        return hasUpperCase && hasLowerCase && hasNumber && isLongEnough;
    };

    const handleSubmit =  async (e: React.FormEvent) => {
        e.preventDefault();
        setAuthError("");
        
        setValidationErrors({
            email: "",
            password: "",
        });

        // Validate email
        if (!validateEmail(email)) {
        setValidationErrors((prev) => ({
            ...prev,
            email: "Please enter a valid email address",
        }));
        return;
        }

        // Validate password
        if (!validatePassword(password)) {
            setValidationErrors((prev) => ({
            ...prev,
            password:
                "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, and one number",
            }));
            return;
        }

        try {
            const success = await login(email, password);
            if (success) {
                toast({
                title: 'Login Successful.',
                description: "You have logged in successfully.",
                status: 'success',
                duration: 2000,
                position: "bottom-left",
                containerStyle: {
                    paddingBottom: "4rem"
                }
                });

                const storedUser = sessionStorage.getItem("currentUser");
                const currentUser = storedUser ? JSON.parse(storedUser) : null;
                if (currentUser) {
                if (currentUser.role === "candidate") {
                    router.push("/candidate");
                } else if (currentUser.role === "lecturer") {
                    router.push("/lecturer");
                }
                }
            }
            } catch (error) {
            if (error instanceof Error) {
                if (error.message.includes("blocked")) {
                setAuthError("Your account has been blocked. Please contact admin.");
                } else {
                setAuthError("Invalid email or password");
                }
            } else {
                setAuthError("Something went wrong. Please try again.");
            }
        }
    };

    return (
    <div>
        <Head>
        <title>Login</title>
        <meta name="description" content="Login to TeachTeam" />
        </Head>

        <main className="main">
        <Box p={8} maxW="500px" mx="auto" border="1px" borderRadius="md" mt="10vh">
        <Link href="/">
            <Button leftIcon={<ArrowLeftIcon />} colorScheme='red'>Back</Button>
        </Link>
            <VStack spacing={8} align="stretch">
                <Heading textAlign="center" paddingTop="5">Sign in</Heading>
                {authError && (
                    <div className="error-message">
                        {authError}
                    </div>
                )}
                <form onSubmit={handleSubmit} noValidate>
                <VStack spacing={4}>
                    <FormControl isRequired isInvalid={!!validationErrors.email}>
                        <FormLabel>Email</FormLabel>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                        <FormErrorMessage>{validationErrors.email}</FormErrorMessage>
                    </FormControl>

                    <FormControl isRequired isInvalid={!!validationErrors.password}>
                        <FormLabel>Password</FormLabel>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                        <FormErrorMessage>{validationErrors.password}</FormErrorMessage>
                    </FormControl>
                    
                    <Button type="submit" colorScheme="red" width="100%" mt={5}>
                        Sign in
                    </Button>
                </VStack>
                </form>
            </VStack>
        </Box>
        </main>
        <Footer />
    </div>
    );
}
