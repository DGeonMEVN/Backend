
const redis = require('redis');

const redisClient = redis.createClient({
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

redisClient.on('connect', () =>{
    console.log("redis connected");
})

redisClient.on('error', (err) =>{
    console.log("redis error", err);
})

redisClient.connect().then()

module.exports = redisClient
