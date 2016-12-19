var express = require('express');
var router = express.Router();
var apiCredential = require('./apiCredential');
var apiUser = require('./apiUser');

router.use('/credential', apiCredential);
router.use('/user', apiUser);

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('this is the API');
});


module.exports = router;
