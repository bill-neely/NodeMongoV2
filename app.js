var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// New Code
var mongo = require('mongodb');
var monk = require('monk');
var mongoURL = process.env.mongoURL || "Could not read environment";
// Must start node in dev by putting the mlab connection string in process.env.mongoURL
//var mongoURL = 'mongodb://bill:652IcDFOy@ds129038.mlab.com:29038/billnodetest1'
var db = monk(mongoURL)

var login = require('./routes/login');
var users = require('./routes/users');
var api = require('./routes/api');
// Get rid of this
var index = require('./routes/index');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Make our db accessible to our router
app.use(function(req, res, next) {
	req.db = db;
	next()
});

app.use('/', login);
app.use('/users', users);
app.use('/api', api);
// Need to get rid of this
app.use('/index', index);

app.use(redirectUnmatched);

function redirectUnmatched(req, res) {
  res.redirect("/");
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
