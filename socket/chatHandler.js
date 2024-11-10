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
    socket.on('private-message', ({ senderId, receiverId, message }) => {
        console.log(`Private message from ${senderId} to ${receiverId}: ${message}`);
        const receiverSocketId = onlineUsers.get(receiverId);
        console.log(`Sending private message to ${receiverSocketId}`);

        if (receiverSocketId) {
            SendMessageSocket(senderId, receiverId,message)
            io.to(receiverSocketId).emit('receive-message', { senderId, message });
            console.log(`Private message sent to ${receiverId}`);
        }else{
            SendMessageSocket(senderId, receiverId,message);
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
