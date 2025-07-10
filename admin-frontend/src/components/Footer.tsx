import { Box, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box as="footer" bg="red.600" color="white" height="60px" display="flex" justifyContent="center" alignItems="center" width="100vw">
      <Text fontSize="md">&copy; 2025 Admin Dashboard - TeachTeam. All rights reserved.</Text>
    </Box>
  );
};

export default Footer;