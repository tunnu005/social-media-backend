import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server as SocketIOServer } from 'socket.io'; // Import Socket.IO Server
import http from 'http'; // Import HTTP to use with Express and Socket.IO
import chatHandler from './socket/chatHandler.js'; // Import your socket handler

// Configure environment variables and connect to MongoDB
dotenv.config();
connectDB();

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5174',
        'http://localhost:5173',
        'https://social-media-frontend-eight-theta.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Set up HTTP server and Socket.IO
const PORT = process.env.PORT || 8000;
const server = http.createServer(app); // Create HTTP server with Express
const io = new SocketIOServer(server, { // Initialize Socket.IO with HTTP server
    cors: {
        origin: [
            'http://localhost:5174',
            'http://localhost:5173',
            'https://buzzzy.vercel.app'
        ],
        credentials: true,
    },
    transports: ['websocket', 'polling'], // Specify transport options to ensure fallback
});

// Use the socket handler to manage events
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    chatHandler(io, socket);
});

// Start the HTTP and WebSocket server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
