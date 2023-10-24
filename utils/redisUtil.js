
const redis = require('redis');

const redisClient = redis.createClient({
    password: 'FwCPcm0JxqdIRFc63mRIZVlPSDGN6svN',
    socket: {
        host: 'redis-11962.c54.ap-northeast-1-2.ec2.cloud.redislabs.com',
        port: 11962
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
