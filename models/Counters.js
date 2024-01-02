const mongoose = require('mongoose');
mongoose.set('debug', true);    //debugging 위한 호출
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, //: MongoDB 연결 문자열의 파싱을 새로운 URL 파서로 수행하도록 하는 옵션
    useUnifiedTopology: true, //MongoDB 드라이버의 새로운 통합 토폴로지 엔진을 사용하도록 하는 옵션으로, 이 옵션을 사용하면 deprecation 경고를 방지
});

/**
 * @author ovmkas
 * @data 2023-12-06
 * @description 공지사항 글번호를 위한 스키마
 */
const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    sequence_value: { type: Number, default: 0 },
});

const Counters = mongoose.model('Counters', counterSchema);

module.exports = { mongoose, Counters };