const mongoose = require("mongoose");

/**
 * @author ovmkas
 * @data 2024-01-18
 * @description 일지 테이블
 */
const tbl_diaryBoard = new mongoose.Schema({
    userId : {type : String, required : true},
    taking : { type : Boolean }, //복용여부
    systolic : { type : Number }, //수축기
    diastolic : { type : Number }, //이완기
    pulse : { type : Number },
    weight : { type : Number }, //체중
    // gagle : { type : String }, //가글 따로 만드는것이 좋을 것 같음 횟수, 시간
    significant : { type : String }, //특이사항
    regDate : { type : Date, default : Date.now()},
    updateDate : {type : Date, default : Date.now()},
    bno : {type : Number}
});

module.exports = mongoose.model("MedisonDiaryDiaryBoard", tbl_diaryBoard, "MedisonDiary_diaryBoard");


