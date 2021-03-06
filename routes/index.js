var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
	res.sendFile(path.join(__dirname, 'html', 'login.html'));
  //res.render('index', { title: 'Express' });
});

/* GET userlist page */
router.get('/userlist', (req, res) => {
	var db = req.db;
	var collection = db.get('usercollection');
	collection.find({},{}, function(e,docs) {
		res.render('userlist', {
			"userlist": docs
		});
	});
});

/* GET New User page */
router.get('/newuser', (req, res) => {
	res.render('newuser', {title: 'Add New User'});
});

/* POST to Add user service */
router.post('/adduser', (req, res) => {
	// Set our internal db variable
	var db = req.db;

	// GET our form values
	var userName = req.body.username;
	var userEmail = req.body.useremail;

	// Set our collection
	var collection = db.get('usercollection');

	// Submit to the DB
	collection.insert({
		"username": userName,
		"email": userEmail
	}, (err, doc) => {
		if (err) {
			// if it failed, return error
			res.send("There was an error in Index.js router.post /adduser");
		}
		else {
			res.redirect("userlist");
		}
	});
});

module.exports = router;
