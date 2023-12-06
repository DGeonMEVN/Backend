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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// cors();
app.use(cors());
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
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/noticeBoard', require('./routes/noticeBoard'));

app.listen(port, function(){
    console.log("Success Port : " + port)
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
    console.log("Mongoose Connected");
});


module.exports = app;
