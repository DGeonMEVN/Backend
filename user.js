const mongoose = require("mongoose");
const Account = new mongoose.Schema({
    userId : {type : String, unique : true, required : true},   //type : 문자, unique : 중복불가, required : 필드명 입력해야함
    userPw : { type : String, required : true},
});

module.exports = mongoose.model("User", Account);