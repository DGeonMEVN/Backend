require('dotenv').config();// dotenv 라이브러리를 사용하여 환경 변수 로딩
const mongoose = require('mongoose'); // mongoose 라이브러리를 사용하여 MongoDB와의 연결 설정
const express     = require('express'); // express 라이브러리를 사용하여 웹 애플리케이션 생성
const app         = express();
const bodyParser  = require('body-parser'); // body-parser 라이브러리를 사용하여 요청 데이터 파싱
const cors = require('cors'); // cors 미들웨어를 사용하여 CORS(Cross-Origin Resource Sharing) 설정
const passport = require('passport'); // passport 라이브러리를 사용하여 인증 설정
const passportConfig = require('./passport'); // passport 설정 파일 로딩
// const authRouter = require('./routes/auth'); // 인증 라우터
const port = 8082; //서버포트설정
// passport 설정 초기화
passportConfig();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// passport 설정 초기화
app.use(cors()); // CORS 미들웨어 적용
// const User = require('./models/user');
// const cookieParser = require("cookie-parser");
// const session = require("express-session");

// app.use(cookieParser(process.env.COOKIE_SECRET));
// app.use(
//     session({
//         resave: false,
//         saveUninitialized: false,
//         secret: process.env.COOKIE_SECRET,
//         cookie: {
//             httpOnly: true,
//             secure: false,
//         },
//     }),
// );
app.use(passport.initialize());
// app.use(passport.session());

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://mevn.ovmkas.co.kr'); //http://localhost:3000으로 설정되어 있어, 이 도메인에서 오는 요청만 허용
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); //GET, POST, PUT, DELETE, OPTIONS 메서드가 허용
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next(); //미들웨어로 제어를 전달
});
// 라우터 설정
app.use('/api/auth', require('./routes/auth'));
app.use('/api/noticeBoard', require('./routes/noticeBoard'));
app.use('/api/diaryBoard', require('./routes/diaryBoard'));
app.get('/', (req, res) => {
    res.send('express 서버입니다.');
});
// 서버 리스닝 및 포트 출력
app.listen(port, function(){
    console.log("Success Port : " + port)
});
// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error); // MongoDB 연결 에러 핸들링

db.once('open', function(){
    console.log("Mongoose Connected");
}); // MongoDB 연결 성공 로그


module.exports = app;
