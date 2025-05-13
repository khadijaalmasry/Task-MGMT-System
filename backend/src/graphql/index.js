const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./typedefs');
const resolvers = require('./resolvers');

async function startApolloServer(app) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    debug: true,
    introspection: true,
    formatError: (err) => {
      console.error(err);
      return err;
    }
  });

  await server.start();
  
  // ✅ Correct CORS settings here:
  server.applyMiddleware({ 
    app,
    path: '/graphql',
    cors: {
      origin: [
        'http://localhost:5173',
        'http://localhost:5175',
        'https://studio.apollographql.com',
        'https://sandbox.apollo.dev'
      ],
      credentials: true
    }
  });

  console.log(`🚀 GraphQL server ready at ${server.graphqlPath}`);
}

module.exports = startApolloServer;
