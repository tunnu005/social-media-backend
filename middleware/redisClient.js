// redisClient.js
import { createClient } from 'redis';
import dotenv from 'dotenv'

dotenv.config();


const client = createClient({
    password: process.env.REDIS_PASSWORD, // Securely use the password from environment variables
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

// Event listener for successful connection
client.on('connect', () => {
    console.log('Connected to Redis successfully!');
});

// Event listener for errors
client.on('error', (err) => {
    console.error('Redis connection error:', err);
});

// Connecting to the Redis server
(async () => {
    try {
        await client.connect();
        console.log('Redis client connected');
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
    }
})();

// Export the client to use in other parts of the app
export default client;
