# ChatSphere — Real-Time Chat Application

A full-stack real-time chat application built with React.js, Node.js, Socket.io, MongoDB, and Cloudinary.

## Features

- 🔐 **JWT Authentication** — Secure register/login with encrypted passwords
- 💬 **Real-Time Messaging** — Instant message delivery via WebSockets
- 🏠 **Multiple Chat Rooms** — Create, join, and switch between rooms
- 📷 **Media Uploads** — Share images and files via Cloudinary CDN
- ⌨️ **Typing Indicators** — See when someone is typing in real-time
- 🟢 **Online Presence** — Track who's online with live status updates
- 📜 **Message History** — Persistent messages stored in MongoDB with pagination
- 🎨 **Dark Glassmorphism UI** — Premium modern design with smooth animations
- 📱 **Responsive Design** — Works on desktop, tablet, and mobile

## Tech Stack

| Frontend | Backend | Database | Media |
|----------|---------|----------|-------|
| React.js | Node.js | MongoDB | Cloudinary |
| Vite | Express.js | Mongoose | multer |
| Socket.io-client | Socket.io | — | — |
| React Router | JWT | — | — |

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Cloudinary account (free tier available)

### 1. Clone & Install

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

### 3. Run the Application

```bash
# Terminal 1 — Start backend
cd server
npm run dev

# Terminal 2 — Start frontend
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

```
├── server/                # Node.js Backend
│   ├── config/            # DB & Cloudinary config
│   ├── controllers/       # Route handlers
│   ├── middleware/         # JWT auth middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API routes
│   ├── socket/            # Socket.io handlers
│   └── server.js          # Entry point
│
├── client/                # React Frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── context/       # Auth & Socket providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── utils/         # Helpers
│   └── index.html
│
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/rooms` | List all rooms |
| POST | `/api/rooms` | Create a room |
| POST | `/api/rooms/:id/join` | Join a room |
| GET | `/api/rooms/:id/messages` | Get message history |
| POST | `/api/upload` | Upload file |

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_room` | Client → Server | Join a chat room |
| `leave_room` | Client → Server | Leave a chat room |
| `send_message` | Client → Server | Send a message |
| `new_message` | Server → Client | New message received |
| `typing` | Client → Server | User typing |
| `user_typing` | Server → Client | Typing indicator |
| `online_users` | Server → Client | Online users list |

## License

MIT
