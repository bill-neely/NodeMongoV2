var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.sendfile("./html/users.html");
});

module.exports = router;
