const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares'); // 내가 만든 사용자 미들웨어
const User = require('../models/user');
const router = express.Router();
const jwt = require('../utils/jwt-util');
const redisClient = require('../utils/redisUtil');
const refresh = require("../utils/refresh");
const authJWT = require('../utils/authJWT')
const jsonwebtoken = require('jsonwebtoken');
const {getProfile, modifyProfile, passwordCheck, deleteUser} = require('../user/profile');
// * 회원 가입

// 사용자 미들웨어 isNotLoggedIn을 통과해야 async (req, res, next) => 미들웨어 실행
/**
 * @author ovmkas
 * @data 2023-09-26
 * @description 회원가입을 위한  join 사용하지 않음
 */
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    // console.log("조인")
    const { userId, userPw, userName, gender } = req.body; // 프론트에서 보낸 폼데이터를 받는다.

    try {
        // 기존에 이메일로 가입한 사람이 있나 검사 (중복 가입 방지)
        const exUser = await User.findOne({ where: { userId } });
        if (exUser) {
            return res.redirect('/join?error=exist'); // 에러페이지로 바로 리다이렉트
        }

        // 정상적인 회원가입 절차면 해시화
        const hash = await bcrypt.hash(userPw, 12);

        // DB에 해당 회원정보 생성
        await User.create({
            userId,
            userPw: hash, // 비밀번호에 해시문자를 넣어준다.
            userName,
            gender,
        });

        return res.redirect('/');
    } catch (error) {
        console.error(error);
        return next(error);
    }
});

/**
 * @author ovmkas
 * @data 2023-09-04, 2023-09-23
 * @description login을 위한 함수로 로그인 되지 않은(isNotLoggedIn) 상태에서 접근 가능하다. vue에 user의 정보를 담아서 보낸다
 * @return user
 */
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if(err) {
            console.error(err);
            return next(err);
        }
        if(!user) {
            return res.redirect(`/auth/?loginError=${info.message}`);
        }


        return req.login(user, { session : false },(loginError) => {
            if(loginError) {
                console.error(loginError);
                return next(loginError);
            }

            if (user) { // id, pw가 맞다면..
                // access token과 refresh token을 발급합니다.
                const accessToken = `Bearer ` + jwt.sign(user);
                const refreshToken = jwt.refresh();
                const userId = user.userId;
                // 발급한 refresh token을 redis에 key를 user의 id로 하여 저장합니다.
                redisClient.set(user.userId, refreshToken);
                redisClient.expire(user.userId, 180 ); //Token 유효기간60*60*24*7

                res.status(200).json({ // client에게 토큰 모두를 반환합니다.
                    ok: true,
                    data: {
                        accessToken,
                        refreshToken,
                        userId,
                    },
                });
            } else {
                res.status(401).send({
                    ok: false,
                    message: 'password is incorrect',
                });
            }

            // return res.send(user);
            // return res.redirect('/');
        });
    })(req, res, next);
});

/* **************************************************************************************** */


//* 로그아웃 (isLoggedIn 상태일 경우)
// router.get('/logout', isLoggedIn, (req, res) => {
//     // req.user (사용자 정보가 안에 들어있다. 당연히 로그인되어있으니 로그아웃하려는 거니까)
//     req.logout();
//     req.session.destroy(); // 로그인인증 수단으로 사용한 세션쿠키를 지우고 파괴한다. 세션쿠키가 없다는 말은 즉 로그아웃 인 말.
//     res.redirect('/');
//     console.log("로그아웃")
// });

/**
 * @author ovmkas
 * @data 2023-10-06
 * @description logout으로 로그인이 된(isLoggedIn) 상태에서만 접근이 가능하다
 */
router.post('/logout', (req, res) => {
    console.log("로그아웃 호출")
    //세션일때 동작
    // req.logout((err) => {
    //     if(err)  {
    //         console.log(err)
    //         return next(err)
    //     }
    //     // res.clearCookie('connect.sid', {httpOnly: true})
    //     // req.session.destroy();
    //     // res.redirect('/');
    //     redisClient.del('1234');
    //     res.status(200).send({message: '성공!'});
    // })
    try{
        if(req.headers['authorization'] && req.headers['refresh']) {
            const authorizationHeader = req.headers['authorization'].split('Bearer ')[1];
            const refresh = req.headers['refresh'];
            const decoded = jsonwebtoken.decode(authorizationHeader);
            redisClient.del(decoded.userId);
            res.status(200).send({message: 'Success'});
        }else{
            res.status(401).send();
        }
    }catch (err){
        console.log(err);
    }
});

/**
 * @author ovmkas
 * @data 2023-10-06
 * @description 회원 가입 시 ID를 중복 체크해준다 중복된다면 true를 반환하고 중복이 아니면 false를 반환한다
 * @return checkId
 */
router.post('/idcheck', isNotLoggedIn, async (req,res)=>{
    const check = await User.findOne({userId: req.body.userId});
    if(check){
        res.status(200).json({
            checkId: true
        });
    }else{
        res.status(200).json({
            checkId: false
        });

    }

});

/**
 * @author ovmkas
 * @data 2023-08-16
 * @description 회원가입 해주는 함수로써 로그인되지 않은 상태에서 접근이 가능하고 회원가입시 비밀번호를 bcrypt를 설정해준다 DB에 저장된다
 * @return checkId
 */
router.post('/signup', isNotLoggedIn, async (req,res)=>{
    try{
        const user = new User();
        user.userId = req.body.userId;
        user.userPw = bcrypt.hashSync(req.body.userPw, 10);
        //bcrypt를 암호를 해독할때 const result = bcrypt.compareSync(입력값, DB에 저장된 값);
        user.userName = req.body.userName;
        user.gender = req.body.gender;

        await user.save();
        res.json({ message: 'Signup Success!' });
    } catch (err) {
        console.error(err);
        res.json({ message: 'Signup failed!!' });
    }
})

/**
 * @author ovmkas
 * @data 2023-10-30
 * @description Token 재발급을 위함 API
 */
router.get('/refresh', refresh);

/**
 * @author ovmkas
 * @data 2023-10-27
 * @description '내 정보'를 들어가기 위한 API 및 Token 검증작업
 */
router.get('/profile', authJWT, getProfile);

/**
 * @author ovmkas
 * @data 2023-11-03
 * @description 내정보 수정을 위한 API 및 Token 검증
 */
router.put('/modify', authJWT, modifyProfile);


/**
 * @author ovmkas
 * @created  2023-10-27
 * @description '내 정보'를 들어가기 위한 API
 * @modified 2023-12-22
 * @modification Token 검증 작업 추가
 */
router.post('/passwordCheck', authJWT, passwordCheck);

/**
 * @author ovmkas
 * @created  2023-11-03
 * @description 회원탈퇴 및 Token 검증 작업
 */
router.post('/deleteUser', authJWT, deleteUser);

module.exports = router;
