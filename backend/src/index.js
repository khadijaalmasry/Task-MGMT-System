const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const startApolloServer = require('./graphql');
const cors = require('cors');

dotenv.config();
connectDB();

const app = express();

app.use(cors({
    origin: [
      'http://localhost:5175', // Your frontend
      'http://localhost:5173',
      'https://studio.apollographql.com', // Apollo Sandbox
      'https://sandbox.apollo.dev' // Alternative sandbox URL
    ],
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'apollographql-client-name',
      'apollographql-client-version'
    ],
    credentials: true
  }));

// Test route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', graphql: '/graphql' });
});

// Start Apollo Server
startApolloServer(app);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Try these endpoints:
  - REST: http://localhost:${PORT}/health
  - GraphQL: http://localhost:${PORT}/graphql`);
});