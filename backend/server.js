import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebflowClient } from 'webflow-api';
import http from 'http'; // <-- add this
import collectionRoutes from './routes/collectionRoutes.js';
import itemRoutes from './routes/itemRoutes.js';

dotenv.config();

const app = express();
const DEFAULT_PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Initialize Webflow client middleware
app.use((req, res, next) => {
  req.webflow = new WebflowClient({ 
    accessToken: process.env.WEBFLOW_ACCESS_TOKEN 
  });
  next();
});

// Routes
app.use('/api/collections', collectionRoutes);
app.use('/api/collections', itemRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// 🔑 Auto port finder function
function startServer(port) {
  const server = http.createServer(app);

  server.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📝 Health check: http://localhost:${port}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1); // try next port
    } else {
      console.error('❌ Server error:', err);
    }
  });
}

// Start with default port
startServer(Number(DEFAULT_PORT));
