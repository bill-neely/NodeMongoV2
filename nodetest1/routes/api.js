var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('this is the API');
});

router.get('/user', function(req, res, next) {
	//var token = req.query.token;
	//if (validateToken(token, req, res)) {
	//	return;
	//};
	getUsers(req, res, {});
});

router.get('/user/:id', function(req, res, next) {
	var id = req.params['id'];
	var parms = {'_id': new ObjectID(id)};
	getUsers(req, res, parms);
});

router.post('/user', function(req, res, next) {
	addNewUser(req, res);
});

router.delete('/user', function(req, res, next) {
	deleteUser(req, res);
});

function getUsers(req, res, parms) {
	var db = req.db;
	var collection = db.get('usercollection');
	collection.find(parms, function(err, results) {
		console.log("returning from sendusers")
		res.json(results);
	});
}

function addNewUser(req, res) {
	// Set our internal db variable
	var db = req.db;

	// GET our form values
	var userName = req.body.name;
	var userEmail = req.body.email;

	var err = validEntry(userName, userEmail)
	if (err) {
		res.status(400).send(err).end();
		return;
	}

	// Set our collection
	var collection = db.get('usercollection');

	// Submit to the DB
	collection.insert({
		"username": userName,
		"email": userEmail
	}, (err, doc) => {
		if (err) {
			// if it failed, return error
			res.status(500).send(err);
		}
		else {
			res.status(201).json(req.body);
		}
	});
};

function deleteUser(req, res) {
	// Set our internal db variable
	var db = req.db;

	// GET our form values
	var userID = req.body._id;
	console.log('deleteing ' + userID);

	// Set our collection
	var collection = db.get('usercollection');

	// Submit to the DB
	writeResult = collection.remove({"_id": ObjectID(userID)});
	console.log(writeResult);
	res.status(204).end();
}

function validEntry(userName, userEmail, err) {
	// This is not actual email validation - just for show
	if (!(userEmail.includes("@") && userEmail.includes("."))) {
		return("Invalid email address.");
	}
	if (userName.length < 3) {
		return("Name must be at least 3 characters");
	}
	return;
}

function validateToken(token, req, res) {
	console.log('Token = ' + token);
	var db = req.db;
	var collection = db.get('tokens');
	collection.find({"token": token}, function(err, results) {
		if (results.length >= 1) {
			console.log(results);
			console.log("token is valid");
			return;
		}
		else { 
			res.status(401).send("Token is invalid");
			return "Token is invalid";
		}
	});
}

module.exports = router;
