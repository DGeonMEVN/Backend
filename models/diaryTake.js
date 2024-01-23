const mongoose = require("mongoose");

/**
 * @author ovmkas
 * @data 2024-01-22
 * @description 약 복용여부를 기록하는 테이블
 */
const tbl_diaryTake = new mongoose.Schema({
    userId : { type : String, required: true},
    bno : {type : Number, required : true },
    take : {type : Boolean},
    regDate : { type : Date, default : Date.now()},
    updateDate : { type : Date, default : Date.now()},
});

module.exports = mongoose.model("MedisonDiaryTakit", tbl_diaryTake, "MedisonDiary_diaryTakit");