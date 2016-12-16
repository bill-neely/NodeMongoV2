var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('this is the API');
});

router.get('/user', function(req, res, next) {
	req.customParms = {};
	console.log("/user GET");
	validateToken(req, res, getUsers);
});

router.get('/user/:id', function(req, res, next) {
	var id = req.params['id'];
	var parms = {'_id': new ObjectID(id)};
	req.customParms = parms
	validateToken(req, res, getUsers);
});

router.post('/user', function(req, res, next) {
	validateToken(req, res, postUser);
	//addNewUser(req, res);
});

router.delete('/user', function(req, res, next) {
	validateToken(req, res, deleteUser);
	//deleteUser(req, res);
});

function getUsers(req, res) {
	console.log("in getUsers");
	var db = req.db;
	var parms = req.customParms
	var collection = db.get('usercollection');
	collection.find(parms, function(err, results) {
		console.log("returning from sendusers")
		res.json(results);
	});
}

function postUser(req, res) {
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

	var userID = req.body._id
	console.log('postUser.  id = ' + userID);
	if (userID == "") {
		console.log('adding user');
		// Submit to the DB
		collection.insert( {
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

	}
	else {
		console.log('editing user');	
		collection.update( {
			"_id": ObjectID(userID)
		},
		{
			"username": userName,
			"email": userEmail
		}, (err, doc) => {
			if (err) {
			// if it failed, return error
			res.status(500).send(err);
			}
			else {
				res.status(200).json(req.body);
			}
		});
	};

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

function validateToken(req, res, next) {
	console.log("in ValidateToken");
	var authHeader = req.get('Authorization');
	token = new Buffer(authHeader, 'base64').toString();
	console.log('Token = ' + token);
	var db = req.db;
	var collection = db.get('tokens');
	collection.find({"token": token}, function(err, results) {
		if (results.length >= 1) {
			console.log("token is valid");
			next(req, res);
		}
		else { 
			console.log("token is invalid");
			res.status(401).send("Token is invalid").end();
		}
	});
}

module.exports = router;
