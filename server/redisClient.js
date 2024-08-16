import { createClient } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;

console.log(`Connecting to Redis at ${redisUrl} with password: ${process.env.REDIS_PASSWORD}`);

const client = createClient({
    url: redisUrl,
    password: process.env.REDIS_PASSWORD,
});

client.on('error', (err) => {
    console.error('Redis Client Error', err);
});

client.connect()
    .then(() => {
        console.log('Connected to Redis');
    })
    .catch((err) => {
        console.error('Redis Connection Error:', err);
    });

export default client;
