var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
var mongoose = require('mongoose');
var http = require('http');
var methodOverride = require('method-override');
var session = require('express-session');
var flash = require('connect-flash');
var busboy = require('connect-busboy');

var bodyParser = require('body-parser');

var cookieParser = require('cookie-parser');

var routes = require('./routes');
var configAuth = require('./config')();

var app = express();

mongoose.connect(configAuth.MONGO_SERVER_PATH);
app.use(bodyParser.json());
// app.use(bodyParser.raw());
app.use(bodyParser.urlencoded({
  extended: false
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(busboy());
app.use(logger('dev'));
// app.use(express.json());
app.use(express.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Allow CORS
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
  next();
});

app.use('/api', routes);
app.get('/', function (req, res) {
  res.send("Backend Services");
});
app.listen(configAuth.APP_PORT);
console.log("Port running on " + configAuth.APP_PORT);