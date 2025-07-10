import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, Flex } from "@chakra-ui/react";
 import { AdminAuthProvider } from "../context/AdminAuthContext";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider>
      <AdminAuthProvider>
      <Flex direction="column" minH="100vh">
        <Header />
        <Flex as="main" flex="1" bg="gray.50" align="center" justify="center">
          <Component {...pageProps} />
        </Flex>
        <Footer />
      </Flex>
      </AdminAuthProvider>
    </ChakraProvider>
    );
}
