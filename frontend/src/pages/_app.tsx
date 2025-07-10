import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { AuthProvider } from "../context/AuthContext";
import Header from "../components/Header";
import Navigation from "../components/Navigation";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
        <Header />
        <Navigation />
        <ChakraProvider>
          <Component {...pageProps} />
        </ChakraProvider>
    </AuthProvider>
    );
}
