const mongoose = require("mongoose");
// const AutoIncrement = require("mongoose-sequence")(mongoose);

/**
 * @author ovmkas
 * @data 2023-12-06
 * @description 공지사항 테이블
 */
const tbl_NoticeBoard = new mongoose.Schema({
    userId : {type : String, required : true},
    title : { type : String, required : true},
    content : { type : String },
    regDate : { type : Date, default : Date.now()},
    updateDate : {type : Date, default : Date.now()},
    bno : {type : Number}
});
// tbl_Board.plugin(AutoIncrement, { inc_field : 'bno' } )

module.exports = mongoose.model("MedisonDiaryBoard", tbl_NoticeBoard, "MedisonDiary_NoticeBoard");


