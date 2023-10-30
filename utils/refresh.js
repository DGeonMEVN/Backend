const { sign, verify, refreshVerify } = require('./jwt-util');
const jwt = require('jsonwebtoken');

const refresh = async (req, res) => {
    console.log("refresh.js 호출")
    console.log("refresh.js authorization = ", req.headers.authorization)
    console.log("refresh.js refresh =", req.headers.refresh)
    // access token과 refresh token의 존재 유무를 체크합니다.
    /* vuex의 access, refresh token 값을 받아와 확인 */
    // authorization = accessToken / refresh = refreshToken
    if (req.headers.authorization && req.headers.refresh) {
        const authToken = req.headers.authorization.split('Bearer ')[1];
        const refreshToken = req.headers.refresh;
        console.log('refresh.js authToken = ', authToken)
        console.log('refresh.js refreshToken = ', refreshToken)
        // access token 검증 -> expired여야 함.
        const authResult = verify(authToken);

        // access token 디코딩하여 user의 정보를 가져옵니다.
        const decoded = jwt.decode(authToken);
        console.log('refresh.js decoded = ', decoded)
        // 디코딩 결과가 없으면 권한이 없음을 응답.
        if (decoded === null) {
            console.log('권한도 없음')
            res.status(401).send({
                ok: false,
                message: 'No authorized!',
            });
        }

        /* access token의 decoding 된 값에서
          유저의 id를 가져와 refresh token을 검증합니다. */
        console.log(decoded.userId)
        const refreshResult = await refreshVerify(refreshToken, decoded.userId);
        console.log('refreshResult = ', refreshResult)
        console.log('refreshResult = ', refreshResult.ok)
        // 재발급을 위해서는 access token이 만료되어 있어야합니다.
        if (authResult.ok === false && authResult.message === 'jwt expired') {
            // 1. access token이 만료되고, refresh token도 만료 된 경우 => 새로 로그인해야합니다.
            if (!refreshResult) {
                console.log('refresh.js 통과 됐니?')
                res.status(401).json({
                    ok: false,
                    message: 'No authorized!',
                });
            } else {
                // 2. access token이 만료되고, refresh token은 만료되지 않은 경우 => 새로운 access token을 발급
                console.log("refresh.js accessToken 없고 refreshToken만 있음")
                const user = {
                    userId: decoded.userId,
                }
                console.log('refresh.js member = ', user)
                const newAccessToken = sign(user);
                console.log('refresh.js newAccessToken = ', newAccessToken)

                res.status(200).json({ // 새로 발급한 access token과 원래 있던 refresh token 모두 클라이언트에게 반환합니다.
                    ok: true,
                    data: {
                        accessToken: `Bearer ${newAccessToken}`,
                        refreshToken,
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
        console.log('비로그인 상태(토큰값 없음)')
        res.status(403).send({
            ok: false,
            message: 'Access token and refresh token are need for refresh!',
        });
    }
};


module.exports = refresh;