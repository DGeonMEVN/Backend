const bcrypt = require('bcrypt');
const User = require('../models/user');
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
        res.send({
            ok : false,
            message : "There is no user information",
        });
    }
}

module.exports = {
    getProfile,
};