var express = require('express');
var router = express.Router();
const ObjectID = require('mongodb').ObjectID

/* GET users listing. */
router.get('/', function(req, res, next) {
	res.send('this is the API');
});

router.get('/user', function(req, res, next) {
	req.customParms = {};
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
	var db = req.db;
	var parms = req.customParms
	var collection = db.get('usercollection');
	collection.find(parms, function(err, results) {
		res.json(results);
	});
}

function postUser(req, res) {
	var userID = req.body._id
	var userName = req.body.name;
	var userEmail = req.body.email;
	var err = validEntry(userName, userEmail)
	if (err) {
		res.status(400).send(err).end();
		return;
	}
	if (userID == "") {
		addUser(req, res);
	}
	else {
		editUser(req, res);
	};
};

function addUser(req, res) {
		var userName = req.body.name;
		var userEmail = req.body.email;
		var db = req.db;
		var collection = db.get('usercollection');
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
};

function editUser(req, res) {
	var userID = req.body._id
	var userName = req.body.name;
	var userEmail = req.body.email;
	var db = req.db;
	var collection = db.get('usercollection');
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

function deleteUser(req, res) {
	var db = req.db;
	var userID = req.body._id;
	var collection = db.get('usercollection');
	writeResult = collection.remove({"_id": ObjectID(userID)});
	res.status(204).end();
}

function validEntry(userName, userEmail, err) {
	if (!(userEmail.includes("@") && userEmail.includes("."))) {
		return("Invalid email address.");
	}
	if (userName.length < 3) {
		return("Name must be at least 3 characters");
	}
	return;
}

function validateToken(req, res, next) {
	var authHeader = req.get('Authorization');
	if (typeof(authHeader) == "undefined") {
		res.status(401).send("No Authorization token found").end();
	}
	else {
		token = new Buffer(authHeader, 'base64').toString();
		var db = req.db;
		var collection = db.get('tokens');
		collection.find({"token": token}, function(err, results) {
			if (results.length >= 1) {
				next(req, res);
			}
			else { 
				res.status(401).send("Token is invalid").end();
			};
		});
	};
};

module.exports = router;
