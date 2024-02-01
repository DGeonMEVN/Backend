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
    regDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
    updateDate: { type: Date, default: () => new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }) },
});

module.exports = mongoose.model("MedisonDiaryGargle", tbl_diaryGargle, "MedisonDiary_diaryGargle");