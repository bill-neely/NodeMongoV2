var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.sendfile("./html/login.html");
});

module.exports = router;
