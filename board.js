const mongoose = require("mongoose");

const Board = new mongoose.Schema({
    title : {type : String, unique : true, required : true},   //type : 문자, unique : 중복불가, required : 필드명 입력해야함
    content : { type : String, required : true},
    writer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true}

});

module.exports = mongoose.model("Board", Board);