const mongoose = require("mongoose");

/**
 * @author ovmkas
 * @data 2024-01-22
 * @description 가글 여부를 기록하는 테이블
 */
const tbl_diaryGargle = new mongoose.Schema({
    userId : { type : String, required: true},
    bno : {type : Number, required : true },
    gargle : {type : Boolean},
    regDate : { type : Date, default : Date.now()},
    updateDate : { type : Date, default : Date.now()},
});

module.exports = mongoose.model("MedisonDiaryGargle", tbl_diaryGargle, "MedisonDiary_diaryGargle");