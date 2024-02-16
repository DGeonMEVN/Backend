const { sign, verify, refreshVerify } = require('./jwt-util');
const jwt = require('jsonwebtoken');
const redisClient = require("./redisUtil");
const User = require("../models/user");
/**
 * @author ovmkas
 * @data 2023-10-30
 * @description 권한이 있는 페이지 접근시 aToken rToken을 새로 발급 해준다
 * @return Token 전달
 */
const refresh = async (req, res) => {
    const userRedis = await redisClient.get(req.headers.userid);
    // console.log("refresh.js 호출")
    // console.log("refresh.js authorization = ", req.headers.authorization)
    // console.log("refresh.js refresh =", req.headers.refresh)
    // access token과 refresh token의 존재 유무를 체크합니다.
    /* vuex의 access, refresh token 값을 받아와 확인 */
    // authorization = accessToken / refresh = refreshToken
    if (req.headers.authorization && userRedis) {
        const authToken = req.headers.authorization.split('Bearer ')[1];
        // const refreshToken = req.headers.refresh;
        const refreshToken = userRedis;
        // console.log('refresh.js authToken = ', authToken)
        // console.log('refresh.js refreshToken = ', refreshToken)
        // access token 검증 -> expired여야 함.
        const authResult = verify(authToken);

        // access token 디코딩하여 user의 정보를 가져옵니다.
        const decoded = jwt.decode(authToken);
        // console.log('refresh.js decoded = ', decoded)
        // 디코딩 결과가 없으면 권한이 없음을 응답.
        if (decoded === null) {
            res.status(401).send({
                ok: false,
                message: 'No authorized!',
            });
        }

        /* access token의 decoding 된 값에서
          유저의 id를 가져와 refresh token을 검증합니다. */
        // console.log(decoded.userId)
        const refreshResult = await refreshVerify(refreshToken, decoded.userId);
        // console.log('refreshResult = ', refreshResult)
        // console.log('refreshResult = ', refreshResult.ok)
        // 재발급을 위해서는 access token이 만료되어 있어야합니다.
        if (authResult.ok === false && authResult.message === 'jwt expired') {
            // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
            if (!refreshResult) {
                res.status(401).json({
                    ok: false,
                    message: 'No authorized!',
                });
            } else {
                // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
                const user = {
                    userId: decoded.userId,
                }
                const newAccessToken = sign(user);
                const userInfo = await User.findOne({userId : user.userId});
                console.log("authority==================================================="+userInfo.authority);
                res.status(200).json({ // 새로 발급한 access token과 원래 있던 refresh token 모두 클라이언트에게 반환합니다.
                    ok: true,
                    data: {
                        accessToken: `Bearer ${newAccessToken}`,
                        refreshToken,
                        userId : user.userId,
                        authority : userInfo.authority,
                    },
                });
            }
        } else {
            // 3. access token이 만료되지 않은경우 => refresh 할 필요가 없습니다.
            res.status(400).send({
                ok: false,
                message: 'Access token is not expired!',
            });
        }
    } else { // access token 또는 refresh token이 헤더에 없는 경우
         res.status(403).send({
            ok: false,
            message: 'Access token and refresh token are need for refresh!',
        });
    }
};


module.exports = refresh;