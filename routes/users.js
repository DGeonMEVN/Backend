var express = require('express');
const mongoose = require("mongoose");
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  // console.log("유저")
  res.send('respond with a resource');
});



module.exports = router;
