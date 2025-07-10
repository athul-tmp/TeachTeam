import { Box, Heading, Text, Avatar, VStack, Button } from "@chakra-ui/react";
import Link from "next/link";
import Head from "next/head";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeftIcon } from "@chakra-ui/icons";

function capitalise(text: string | undefined): string {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export default function ProfilePage() {
  
  const { user } = useAuth();
  if (!user) return; 

  return (
    <div>
    <Head>
      <title>Profile</title>
      <meta name="description" content="User profile page" />
    </Head>

      <main className="main">
        <Box p={8} maxW="600px" mx="auto" border="1px" borderRadius="md" mt="10vh">
          <Link href={`/${user?.role}`} passHref>
            <Button leftIcon={<ArrowLeftIcon />} colorScheme="red">
              Back
            </Button>
          </Link>
          <Heading size="md" textAlign="center">
              Profile Page
          </Heading>
          <VStack spacing={6} align="center" mt={6}>
            <Avatar size="xl" name={user ? `${user.firstName} ${user.lastName}` : ""} bg="red.500" color="white"/>
            <Box>
              <Box textAlign="left" w="100%">
                <Text>
                  <span style={{ fontWeight: "bold" }}>First Name:</span>{" "}
                  {capitalise(user?.firstName) || "N/A"}
                </Text>
                <Text>
                  <span style={{ fontWeight: "bold" }}>Last Name:</span>{" "}
                  {capitalise(user?.lastName) || "N/A"}
                </Text>
                <Text>
                  <span style={{ fontWeight: "bold" }}>Email:</span>{" "}
                  {user?.email || "N/A"}
                </Text>
                <Text>
                  <span style={{ fontWeight: "bold" }}>Role:</span>{" "}
                  {capitalise(user?.role) || "N/A"}
                </Text>
                <Text>
                  <span style={{ fontWeight: "bold" }}>Join Date:</span>{" "}
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-AU", {day: "2-digit",month: "short",year: "numeric"}) : "N/A"}
                </Text>
              </Box>
            </Box>
          </VStack>
        </Box>
      </main>
    </div>
  );
}
