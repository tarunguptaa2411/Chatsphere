const path = require('path');
const fs = require('fs');

// Load .env from server directory (for local dev)
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const connectDB = require('./config/db');
const socketHandler = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

// Validate critical env vars
if (!process.env.MONGO_URI) {
  console.error('❌ MONGO_URI is not set. Please set it in environment variables or server/.env');
  process.exit(1);
}
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set. Please set it in environment variables or server/.env');
  process.exit(1);
}

console.log('📋 Environment check passed');
console.log(`   MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Missing'}`);
console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Missing'}`);
console.log(`   CLOUDINARY: ${process.env.CLOUDINARY_CLOUD_NAME ? '✅ Set' : '⚠️ Not set (image uploads disabled)'}`);

const app = express();
const server = http.createServer(app);

// CORS config
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5000',
].filter(Boolean);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Middleware
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    return callback(null, true);
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', chatRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// Serve React frontend in production
const clientBuildPath = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientBuildPath)) {
  console.log(`📂 Serving static files from: ${clientBuildPath}`);
  app.use(express.static(clientBuildPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
} else {
  console.log('⚠️ No client build found. Run: npm run build --prefix client');
  app.get('*', (req, res) => {
    res.status(404).json({ message: 'Client not built. API is running at /api/*' });
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Initialize Socket.io
socketHandler(io);

// Connect to DB and start server
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`\n🚀 Server running on port ${PORT}`);
      console.log(`📡 Socket.io ready for connections`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to start:', err.message);
    // Wait for logs to flush before exiting
    setTimeout(() => process.exit(1), 1000);
  });
