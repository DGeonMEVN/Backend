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
    // regDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
    // updateDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
    regDate : {type:Date, default: ()=>new Date() },
    updateDate : {type:Date, default: ()=>new Date() },
});

module.exports = mongoose.model("MedisonDiaryTakit", tbl_diaryTake, "MedisonDiary_diaryTakit");