import Footer from "../components/Footer";
import { Box, Heading, Flex, Text, VStack, Spinner } from "@chakra-ui/react";
import Head from "next/head";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const { authLoading } = useAuth();

  if (authLoading) {
    return (
      <Flex height="100vh" justify="center" align="center">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <div>
      <Head>
        <title>TeachTeam - Homepage</title>
        <meta name="description" content="TeachTeam homepage" />
      </Head>
      <main className="main">

      <Flex align="center" justify="center" gap={12} px={10}>
        <Box>
        <Image src="/images/image-1.jpg" alt="Tutor helping students" width={660} height={300} className="style-image"/>
        </Box>

        <Box className="text" maxW="md" ml={5}>
          <Heading size="xl" mb={4}>Welcome to TeachTeam</Heading>
          <Text fontSize="lg" mb={6}>
          Find the right tutor with TeachTeam!
          </Text>

          <VStack align="start" spacing={4}>
              <Heading size="md">Lecturers:</Heading>
              <Text>Browse through a pool of skilled tutors and select the best candidates.</Text>
          </VStack>

          <VStack align="start" spacing={4} mt={4}>
            <Heading size="md">Tutors:</Heading>
            <Text> Share your expertise and inspire the next generation.</Text>
            <Text>  Apply as a tutor by submitting your qualifications and teaching experience.</Text>
          </VStack>
          <Heading size="md" mt={4} mb={4}>Sign in or Sign up to continue!</Heading>
        </Box>
      </Flex>
    </main>
    <Footer />
    </div>
  );
}
