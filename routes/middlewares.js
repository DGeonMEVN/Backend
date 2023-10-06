/**
 * @author ovmkas
 * @data 
 * @description 로그인이 되어있을때만 접근가능
 */
exports.isLoggedIn = (req, res, next) => {
    // isAuthenticated()로 검사해 로그인이 되어있으면
    if (req.isAuthenticated()) {
        next(); // 다음 미들웨어
    } else {
        res.status(403).send('로그인 필요');
    }
};

/**
 * @author ovmkas
 * @data
 * @description 로그인이 되지 않아도 접근가능
 */
exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next(); // 로그인 안되어있으면 다음 미들웨어
    } else {
        console.log("req.user",req.user);
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};
