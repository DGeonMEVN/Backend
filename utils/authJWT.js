const { verify } = require('./jwt-util');


/**
 * @author ovmkas
 * @created  2023-10-11
 * @description Token검증을 위한 컴포넌트
 */
const authJWT = (req, res, next) => {
    // console.log("authJWT req.headers.authorization = " , req.headers.authorization);
    if (req.headers.authorization) {
        const token = req.headers.authorization.split('Bearer ') [1]; // header에서 access token을 가져옵니다.
        const result = verify(token); // token을 검증합니다.
        if (result.ok) { // token이 검증되었으면 req에 값을 세팅하고, 다음 콜백함수로 갑니다.
            req.userId = result.userId;
            console.log("authJWT result.ok = 통과" , req.userId);
            next();
        } else { // 검증에 실패하거나 토큰이 만료되었다면 클라이언트에게 메세지를 담아서 응답합니다.
            console.log("authJWT result.ok = 미통과" );
            res.status(401).json({
                ok: false,
                message: result.message, // jwt가 만료되었다면 메세지는 'jwt expired'입니다.
            });
        }
    }
};

module.exports = authJWT;




