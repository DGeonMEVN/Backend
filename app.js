require('dotenv').config();
const mongoose = require('mongoose');
const express     = require('express');
const app         = express();
const bodyParser  = require('body-parser');
const cors = require('cors');//적용전

const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());


const User = require('./user');
const router = require('./router')(app,User)

app.listen(port, function(){
  console.log("Success Port : " + port)
});

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
  console.log("Connection Success");
});