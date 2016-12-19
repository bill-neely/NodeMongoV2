var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt');
const uuidV1 = require('uuid/v1');
const saltRounds = 10;	

router.get('/', function(req, res) {
	verifyLogin(req, res);
});

router.post('/', function(req, res) {
	console.log("credential post");
	validateNewUser(req, res);
});

function verifyLogin(req, res) {
	var userEmail = req.get('userEmail');
	var userPassword = new Buffer(req.get('userPassword'), 'base64').toString();
	var userPassword = req.get('userPassword');
	var db = req.db;
	var collection = db.get('credentials');
	collection.find({ "email" : userEmail }, function(err, results) {
		if (err) {
			res.status(500).send(err).end();
		}
		else {
			if (results.length == 1) {
				// found user email - check password
				var userID = results[0]._id.toString();
				collection = db.get('credentialsecrets');
				collection.find( { 'forCredential' : userID }, function(err, results) {
					if (err) {
						res.status(500).send(err).end();
					}
					else {
						if (results.length == 1) {
							var hash = results[0].password;
							console.log('userPassword = ' + userPassword);		
							console.log('hash = ' + hash);		
							bcrypt.compare(userPassword, hash, function(err, result) {
    							if (result == true) {
    								sendNewToken(req, res, userID);
    							}
    							else {
    								// bad form - should send same failure as invalid user
    								res.status(404).send("Invalid pass");
    							};
							});
						}
						else {
							res.status(404).send("no stored password").end();
						}
					};
				});
			}
			else {
				res.status(404).send("Invalid User");
			}
		}
	});
};

function sendNewToken(req, res, userID) {
	newValidToken = uuidV1();
	token = { 'token' : newValidToken };
	var now = Date.now();
	var db = req.db;
	collection = db.get('tokens');
	collection.insert( {
		"forCredential" : userID,
		"token" : newValidToken,
		"issued" : now,
		"lastUsed" : now
	}, (err, doc) => {
		if (err) {
			// if it failed, return error
			res.status(500).send(err);
		}
		else {
			res.status('200').json(token).end();
		}
	});
};

function validateNewUser(req, res) {
	console.log("validateNewUser");
	console.log(req.body);
	var newUserEmail = req.body.newUserEmail;
	var newUserName = req.body.newUserName;
	var newPassword = req.body.newPassword;
	// validate user is email
	// validate user is unique
	// validate password meets requirements
	saveNewUser(req, res, newUserEmail, newUserName, newPassword);
};

function saveNewUser(req, res, newUserEmail, newUserName, newPassword) {
	console.log("saveNewUser");
	console.log("email = " + newUserEmail);
	console.log("name = " + newUserName);
	console.log("password = " + newPassword);
	var db = req.db;
	var collection = db.get('credentials');
	console.log("saving credential");
	collection.insert( { "email": newUserEmail, "name": newUserName }, (err, doc) => {
		if (err) {
			// if it failed, return error
			res.status(500).send(err);
		}
		else {
			console.log("saving credentialsecret");
			var newUserID = doc["_id"].toString();
			bcrypt.hash(newPassword, saltRounds, function(err, hash) {
				console.log("done bcrypt");
				collection = db.get("credentialsecrets");
				collection.insert( { "forCredential": newUserID, "password": hash }, (err, doc) => {
					if (err) {
						// if it failed, return error
						res.status(500).send(err);
					}
					else {
						res.status(201).json(req.body);
					}
				});
			});
		};
	});
};

module.exports = router;
