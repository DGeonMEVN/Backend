const mongoose = require("mongoose");

/**
 * @author ovmkas
 * @data 2023-08-24
 * @description 공지사항 글번호를 위한 스키마
 */
const tbl_User = new mongoose.Schema({
    userId : {type : String, unique : true, required : true},   //type : 문자, unique : 중복불가, required : 필드명 입력해야함
    userPw : { type : String, required : true},
    userName : { type : String, required : true},
    gender : {type : Boolean, require : true},
    // regDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
    // updateDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
    regDate : {type:Date, default: ()=>new Date() },
    updateDate : {type:Date, default: ()=>new Date() },
    authority : {type : String, default : "user"}
});

module.exports = mongoose.model("MedisonDiaryUser", tbl_User, "MedisonDiary_User");