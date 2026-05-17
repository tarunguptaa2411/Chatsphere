const path = require('path');
const fs = require('fs');

// Global error handlers - catch everything
process.on('uncaughtException', (err) => {
  process.stderr.write(`\n❌ UNCAUGHT EXCEPTION: ${err.message}\n${err.stack}\n`);
  setTimeout(() => process.exit(1), 2000);
});
process.on('unhandledRejection', (err) => {
  process.stderr.write(`\n❌ UNHANDLED REJECTION: ${err.message || err}\n`);
  setTimeout(() => process.exit(1), 2000);
});

// Load .env from server directory (for local dev)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const socketHandler = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Validate critical env vars
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  process.stderr.write('❌ MONGO_URI is not set!\n');
  process.exit(1);
}
if (!JWT_SECRET) {
  process.stderr.write('❌ JWT_SECRET is not set!\n');
  process.exit(1);
}

// Ensure database name is in the URI
let mongoUri = MONGO_URI;
if (mongoUri.includes('mongodb.net/') && mongoUri.includes('mongodb.net/?')) {
  mongoUri = mongoUri.replace('mongodb.net/?', 'mongodb.net/chatapp?');
} else if (mongoUri.includes('mongodb.net/') && !mongoUri.split('mongodb.net/')[1].split('?')[0]) {
  mongoUri = mongoUri.replace('mongodb.net/', 'mongodb.net/chatapp');
}

process.stdout.write(`📋 Environment: OK\n`);
process.stdout.write(`🔗 MongoDB URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}\n`);

const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Socket.io
const io = new Server(server, {
  cors: { origin: true, methods: ['GET', 'POST'], credentials: true },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Serve React frontend
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  process.stdout.write(`📂 Static files: ${clientBuildPath}\n`);
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Error handler
app.use((err, req, res, next) => {
  process.stderr.write(`🔥 Error: ${err.stack}\n`);
  res.status(500).json({ message: 'Internal server error' });
});

// Socket handlers
socketHandler(io);

// Start
const PORT = process.env.PORT || 5000;

process.stdout.write('🔄 Connecting to MongoDB...\n');

mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 15000 })
  .then((conn) => {
    process.stdout.write(`✅ MongoDB Connected: ${conn.connection.host}\n`);
    server.listen(PORT, () => {
      process.stdout.write(`🚀 Server running on port ${PORT}\n`);
      process.stdout.write(`📡 Socket.io ready\n`);
    });
  })
  .catch((err) => {
    process.stderr.write(`❌ MongoDB Error: ${err.message}\n`);
    process.stderr.write(`💡 Fix: Go to MongoDB Atlas → Network Access → Add 0.0.0.0/0\n`);
    setTimeout(() => process.exit(1), 2000);
  });
