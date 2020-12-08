require( 'dotenv' ).config();
require('console-stamp')(console, 'yyyy/mm/dd HH:MM:ss');

// Module Load
const createError = require('http-errors');
const express = require('express');
const path    = require('path');
const cookieParser = require('cookie-parser');
const logger  = require('morgan');
const passport = require('passport');
const session = require('express-session');
const flash   = require('connect-flash');

// Module Container 
global.dicontainer = require( './module/diContainer' )();
dicontainer.register( "BigNumber", require( 'bignumber.js' ) );
dicontainer.register( "pathUtil", require( 'path' ) );
dicontainer.register( "crypto", require( 'crypto' ) );
dicontainer.factory( "CommonConfig", require( "./config/CommonConfig" ) );
dicontainer.factory( "Err", require( './module/error-handle' ) );
dicontainer.factory( "JSONResponse", require( "./module/JSON-Response" ) );
dicontainer.factory( "DB", require( './module/sql' ) );


// Router Load
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/login');
var chargeRouter = require('./routes/charge');
var sendRouter = require('./routes/send');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// app.use(logger('dev'));
//express setting
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//cookie setting
app.use(session({
  secret: 'epayepaysession',
  resave: true,
  saveUninitialized: true,
  cookie : { secure : false, maxAge : (1 * 60 * 60 * 24000) }
}));

//passport setting
require('./module/passport')(passport);
app.use(passport.initialize());
app.use(passport.session()); //로그인 세션 유지
app.use(flash());


//ejs global variable setting
app.use(function(req, res, next) {
  res.locals.apiurl = process.env.APIURL;
  res.locals.isauthortype = "";
  
  if(process.env.DBUSER == "u_local_rw"){
    res.locals.runlocal = "Y";
  }else{
    res.locals.runlocal = "N";
  }
  next();
});

//router setting
app.use('/', indexRouter);
app.use('/', loginRouter);
app.use('/charge', chargeRouter);
app.use('/send', sendRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
