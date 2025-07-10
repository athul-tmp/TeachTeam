import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";

// Reference: Based on Week 10 tutorial code
const httpLink = createHttpLink({
  uri: "http://localhost:3003/graphql", 
});

export const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});
