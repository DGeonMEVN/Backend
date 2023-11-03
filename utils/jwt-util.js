const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const redisClient = require('./redisUtil');
const secret = process.env.SECRET;

/**
 * @author ovmkas
 * @data 2023-10-30
 * @description Jwt 생성 및 검증
 */
module.exports = {
    sign: (user) => { // access token 발급
        const payload = { // access token에 들어갈 payload
            userId: user.userId,
            // expiresIn : '5s',
        };

        return jwt.sign(payload, secret, { // secret으로 sign하여 발급하고 return
            algorithm: 'HS256', // 암호화 알고리즘
            expiresIn: '30s', 	  // 유효기간
        });
    },
    verify: (token) => { // access token 검증
        let decoded = null;
        try {
            decoded = jwt.verify(token, secret);
            console.log("jwt-util verify")
            return {
                ok: true,
                userId: decoded.userId,
            };
        } catch (err) {
            return {
                ok: false,
                message: err.message,
            };
        }
    },
    refresh: () => { // refresh token 발급
        return jwt.sign({}, secret, { // refresh token은 payload 없이 발급
            algorithm: 'HS256',
            expiresIn: '180s',
        });
    },
    refreshVerify: async (token, userId) => {
        // const getAsync = promisify(redisClient.get).bind(redisClient);
        // console.log('jwtUtil getAsync = ', getAsync)

        try {
            // const data =  await getAsync(userId);
            const data = await redisClient.get(userId)
            // const data = await redisClient.get(userId);
            // const data = await redisClient.get(username)
            console.log('data = ', data)
            console.log('token = ', token)
            if(token === data) {
                try {
                    jwt.verify(token, secret);
                    return true;
                } catch (err) {
                    return {
                        ok: false,
                    };
                }

            }else {
                return false;
            }
        } catch (error) {
            console.error('error', error)
            return false;
        } finally {
            console.log("finally");
        }
    },
};