const mongoose = require("mongoose");

/**
 * @author ovmkas
 * @data 2024-01-18
 * @description 일지 테이블
 */
const tbl_diaryBoard = new mongoose.Schema({
    userId : {type : String, required : true},
    weight : { type : Number }, //체중
    significant : { type : String }, //특이사항
    regDate : { type : Date, default : Date.now()},
    updateDate : {type : Date, default : Date.now()},
    bno : {type : Number, required : true}
});


module.exports = mongoose.model("MedisonDiaryDiaryBoard", tbl_diaryBoard, "MedisonDiary_diaryBoard");

