const bcrypt = require('bcrypt');
const User = require('../models/user');

/**
 * @author ovmkas
 * @data 2023-10-27
 * @description 마이페이지의 user정보를 반환한다
 * @return user정보를 전달
 */
const getProfile = async (req, res) => {
    // console.log("getProfile req = ", req);
    const {userId} = req;
    // console.log("getProfile userId = ",userId);
    const user = await User.findOne({
            userId: userId
    });
    console.log("getProfile user = ", user);
    if(user){
        const { userId, userPw, userName, gender } = user;
        res.status(200).send({
            ok : true,
            data : {
                userId,
                userPw,
                userName,
                gender,
            },
        });
    }else{
        res.status(401).send({
            ok : false,
            message : "There is no user information",
        });
    }
}
/**
 * @author ovmkas
 * @data 2023-10-30
 * @description 마이페이지의 user정보(닉네임 변경)를 수정한다
 * @return ok, message 전달
 */
const modifyProfile  = async (req,res) => {
    try {
        const user = await User.findOne({userId: req.body.userId});
        if(user && bcrypt.compareSync(req.body.userPw, user.userPw)) {
            // user.userName = req.body.userName;
            // user.userPw = bcrypt.hashSync(req.body.userPw, 10);
            // user.updateDate = Date.now();
            // console.log("auth modify saveUser", user)
            // user.save();
            await User.updateOne(
                {userId: req.body.userId},
                {
                    $set:
                        {
                            userName: req.body.userName,
                            updateDate: Date.now()
                        }
                })
            res.status(200).json({ok: true, passCheck : true, message: "modify Success!"})
        }else{
            res.status(200).json({ok: false, passCheck :  false, message: "password failed!!"})
        }
    } catch (err) {
        res.status(401).json({ok: false, message: "modify failed!!"})
    }
}
/**
 * @author ovmkas
 * @data 2023-10-31
 * @description 마이페이지의 user정보(비밀번호)를 수정한다
 * @return ok, message 전달
 */
const passwordCheck = async (req,res)=>{
    try{
        const user = await User.findOne({userId: req.body.userId});
        if(user && bcrypt.compareSync(req.body.userPw, user.userPw)) {
            await User.updateOne(
                {userId: req.body.userId},
                {
                    $set:
                        {
                            userPw : bcrypt.hashSync(req.body.newUserPw, 10),
                            updateDate: Date.now()
                        }
            })
            res.status(200).json({
                ok:true,
                passCheck : true,
                message : "회원이 맞습니다",
            })
        }else{
            res.status(200).json({
                ok:false,
                passCheck : false,
                message : "비밀번호가 다릅니다",
            })
        }
    }catch (err){
        res.status(401).json({
            ok:false,
            message : "회원이 없거나 회원정보가 다릅니다",
        })
    }
}

/**
 * @author ovmkas
 * @data 2023-11-03
 * @description 마이페이지의 user를 삭제한다
 * @return ok, message 전달
 */
const deleteUser = async(req, res) =>{
    try {
        const user = await User.findOne({userId: req.body.userId});
        if (user && bcrypt.compareSync(req.body.userPw, user.userPw)) {
            await User.deleteOne({userId : req.body.userId});
            res.status(200).send({
                ok:true,
                passCheck : true,
                message : "회원이 맞습니다",
            })
        }else{
            console.log("비밀번호 틀리다")
            res.status(200).send({
                ok:false,
                passCheck : false,
                message : "회원이 없거나 회원정보가 다릅니다",
            })
        }
    }catch (err){
        res.status(401).send({
            ok:false,
            message : "회원이 없거나 회원정보가 다릅니다",
        })
    }
}
module.exports = {
    getProfile, modifyProfile, passwordCheck, deleteUser
};