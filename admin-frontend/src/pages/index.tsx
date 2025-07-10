import { Box, Button, FormControl, FormLabel, Heading, Input, VStack, FormErrorMessage, useToast, Flex, Spinner} from "@chakra-ui/react";
import Head from "next/head";
import { useState } from "react";
import { useRouter } from "next/router";
import { useAdminAuth } from "../context/AdminAuthContext";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    username: "",
    password: "",
  });

  const toast = useToast();
  const router = useRouter();
  const { login, authLoading } = useAdminAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setValidationErrors({ username: "", password: "" });

    if (username.trim() === "") {
      setValidationErrors((prev) => ({ ...prev, username: "Username is required" }));
      return;
    }

    if (password.trim() === "") {
      setValidationErrors((prev) => ({ ...prev, password: "Password is required" }));
      return;
    }

    try {
      const success = await login(username, password);
      if (success) {
        toast({
          title: "Login Successful.",
          description: "Welcome back, admin!",
          status: "success",
          duration: 2000,
          position: "bottom-left",
        });

        router.push("/dashboard");
      }
    } catch (error) {
      console.log(error);
      setAuthError("Invalid username or password");
    }
  };

  if (authLoading) {
    return (
      <Flex height="100vh" justify="center" align="center">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Login | TeachTeam</title>
        <meta name="description" content="Admin login page for TeachTeam" />
      </Head>

      <Box w="full" maxW="md" p={10} bg="white" borderRadius="md" boxShadow="lg">
        <Heading textAlign="center" mb={6}>
          Admin Login
        </Heading>
        {authError && (
          <Box bg="red.100" border="1px solid" borderColor="red.400" color="red.700" p={3} mb={4} borderRadius="md">
            {authError}
          </Box>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <VStack spacing={5} align="stretch">
            <FormControl isRequired isInvalid={!!validationErrors.username}>
              <FormLabel>Username</FormLabel>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
              <FormErrorMessage>{validationErrors.username}</FormErrorMessage>
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
            <Button type="submit" colorScheme="red" width="full">
              Sign In
            </Button>
          </VStack>
        </form>
      </Box>
    </>
  );
}
