// socket/chatHandler.js

import { SendMessageSocket } from "../controllers/chatController.js";

const onlineUsers = new Map();

function chatHandler(io, socket) {
    console.log(`User connected: ${socket.id}`);

    // Listen for a user joining
    socket.on('join', (userId) => {
        onlineUsers.set(userId, socket.id);
        console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    // Listen for private messages
    socket.on('private-message', async ({ senderId, receiverId, message }) => {
        try {
            console.log(`Private message from ${senderId} to ${receiverId}: ${message}`);
            const receiverSocketId = onlineUsers.get(receiverId);
            
            // Save the message to the database
            await SendMessageSocket(senderId, receiverId, message);
    
            // Send the real-time message only if the receiver is online
            if (receiverSocketId) {
                io.to(receiverSocketId).emit('receive-message', { senderId, message });
                console.log(`Private message sent to ${receiverSocketId}`);
            } else {
                console.log(`User ${receiverId} is offline, message saved for later.`);
            }
        } catch (error) {
            console.error("Failed to save message:", error);
        }
    });
    
    // Handle user disconnect
    socket.on('disconnect', () => {
        onlineUsers.forEach((value, key) => {
            if (value === socket.id) {
                onlineUsers.delete(key);
                console.log(`User ${key} disconnected`);
            }
        });
    });
}

export default chatHandler;
