import express from 'express';
import path from 'node:path'; // Import Node's path module to handle and transform file paths
import type { Request, Response } from 'express';
import db from './config/connection.js';
import { ApolloServer } from '@apollo/server'; // Note: Import from @apollo/server-express 
import { expressMiddleware } from '@apollo/server/express4'; // Import Apollo's Express middleware for integrating ApolloServer with Express
import { typeDefs, resolvers } from './schemas/index.js'; // Import GraphQL type definitions (typeDefs) and resolvers (functions to resolve GraphQL queries)
import { authenticateToken } from './utils/auth.js'; // Import the authentication middleware for handling user authentication via tokens
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); 

// Create an instance of ApolloServer with the typeDefs and resolvers
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start(); // Start the ApolloServer (required before applying middleware)
  await db(); // Establish a connection to the database using the db() function


  const PORT = process.env.PORT || 3001; // Set the port to an environment variable or default to 3001
  const app = express(); // Create an Express application
  

  app.use(express.urlencoded({ extended: true })); // Middleware to parse incoming URL-encoded form data (from forms, typically)
  app.use(express.json());  // Middleware to parse incoming JSON request bodies (for APIs)

  // Apply ApolloServer middleware to handle GraphQL requests at the /graphql endpoint
  app.use('/graphql', expressMiddleware(server as any,
    {
      context: authenticateToken as any // Pass the authenticateToken function to be used as context middleware
    }
  ));

  // Serve static assets (for example, a React build) if in production mode
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist'))); // Serve static files from the React build directory

    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, '../../client/dist/index.html')); // Send index.html for all other routes (client-side routing)
    });
  }

  // Start the server and listen on the specified PORT
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}!`);
    console.log(`Use GraphQL at http://localhost:${PORT}/graphql`);
  });
};

// Start the Apollo server by calling the startApolloServer function
startApolloServer();