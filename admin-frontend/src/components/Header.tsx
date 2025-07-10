import { Box, Heading, Button, HStack } from "@chakra-ui/react";
import { useAdminAuth } from "../context/AdminAuthContext";
import { useRouter } from "next/router";

const Header = () => {
  const { admin, logout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleReportsRoute = () => {
    router.push("/reports");
  };

  return (
    <Box as="header" bg="red.600" color="white" height="80px" px={8} display="flex" alignItems="center" justifyContent="space-between" fontSize="xl" fontWeight="bold" width="100vw">
      <Heading size="md">Admin Dashboard - TeachTeam</Heading>
      {admin && (
        <HStack spacing={4}>
          <Button
            onClick={handleReportsRoute}
            variant="ghost"
            color="white"
            fontWeight="700"
            fontSize="18px"
            _hover={{ color: "black" }}
            _focus={{ boxShadow: "none", bg: "transparent" }}
            _active={{ bg: "transparent", color: "black" }}
          >
            Reports
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            color="white"
            fontWeight="700"
            fontSize="18px"
            px={4}
            _hover={{ color: "black" }}
            _focus={{ boxShadow: "none", bg: "transparent" }}
            _active={{ bg: "transparent", color: "black" }}
          >
            Logout
          </Button>
        </HStack>
      )}
    </Box>
  );
};

export default Header;
