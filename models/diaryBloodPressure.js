const mongoose = require("mongoose");

/**
 * @author ovmkas
 * @data 2024-01-22
 * @description 혈압만 기록하는 테이블
 */
const tbl_diaryBloodPressure = new mongoose.Schema({
    userId : { type : String, required: true},
    bno : {type : Number, required : true },
    bpno : { type : Number, required : true},
    systolic : { type : Number }, //수축기
    diastolic : { type : Number }, //이완기
    pulse : { type : Number },
    // regDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
    // updateDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
    regDate : {type:Date, default: ()=>new Date() },
    updateDate : {type:Date, default: ()=>new Date() },
});

module.exports = mongoose.model("MedisonDiaryBloodPressure", tbl_diaryBloodPressure, "MedisonDiary_diaryBloodPressure");