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
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import redisClient from './middleware/redisClient.js'
import http from 'http';
import chatHandler from './socket/chatHandler.js';

dotenv.config();
connectDB();

const app = express();

// Security Enhancements
app.use(helmet()); // Sets various HTTP headers to protect your app
app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: "Too many requests, please try again later.",
}));

// JSON and Cookie Parsing
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// CORS Configuration
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
        'http://localhost:5174',
        'http://localhost:5173',
        'https://buzzzy.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.get('/', (req, res) => {
    res.send('Hello World!');
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);

// Set up HTTP server and Socket.IO
const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: {
        origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [
            'http://localhost:5174',
            'http://localhost:5173',
            'https://buzzzy.vercel.app'
        ],
        credentials: true,
    },
    transports: ['websocket', 'polling'],
});

// Socket.IO Event Handling
io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);
    chatHandler(io, socket,redisClient);
});

// Start Server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});
