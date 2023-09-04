// require('dotenv').config();
// const mongoose = require('mongoose');
// const express     = require('express');
// const app         = express();
// const bodyParser  = require('body-parser');
// const cors = require('cors');//적용전
// const port = 8080;
//
// const cookieParser = require("cookie-parser");
// const session = require("express-session");
//
// const User = require('./models/user');
// const router = require('./router')(app,User)
//
//
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());
// app.use(cors());
// app.use('/auth/login', require('./routes/auth'));
//
//
//
// const passport = require('passport');
// const passportConfig = require('./passport');
// const authRouter = require('./routes/auth'); // 인증 라우터
// passportConfig();
//  // 패스포트 설정
// app.use(cookieParser(process.env.COOKIE_SECRET));
// app.use(
//     session({
//       resave: false,
//       saveUninitialized: false,
//       secret: process.env.COOKIE_SECRET,
//       cookie: {
//         httpOnly: true,
//         secure: false,
//       },
//     }),
// );
// //! express-session에 의존하므로 뒤에 위치해야 함
// app.use(passport.initialize()); // 요청 객체에 passport 설정을 심음
// app.use(passport.session()); // req.session 객체에 passport정보를 추가 저장
// // passport.session()이 실행되면, 세션쿠키 정보를 바탕으로 해서 passport/index.js의 deserializeUser()가 실행하게 한다.
// //* 라우터
// app.use('/auth', authRouter);
//
//
//
// app.listen(port, function(){
//   console.log("Success Port : " + port)
// });
//
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
// const db = mongoose.connection;
// db.on('error', console.error);
// db.once('open', function(){
//   console.log("Connection Success");
// });

require('dotenv').config();
const mongoose = require('mongoose');
const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const cors = require('cors');//적용전
const passport = require('passport');
const passportConfig = require('./passport');
// const authRouter = require('./routes/auth'); // 인증 라우터
const port = 8080;
passportConfig();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
cors();
const User = require('./models/user');
const router = require('./router')(app,User)
const cookieParser = require("cookie-parser");
const session = require("express-session");

app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.COOKIE_SECRET,
        cookie: {
            httpOnly: true,
            secure: false,
        },
    }),
);
app.use(passport.initialize());
app.use(passport.session());


app.use('/auth', require('./routes/auth'));

app.listen(port, function(){
    console.log("Success Port : " + port)
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("Connection Success");
});


module.exports = app;
