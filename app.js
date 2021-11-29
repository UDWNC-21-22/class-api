var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Connect = require('./src/config/database.js');
const cors = require('cors')
var indexRouter = require('./src/routes/index');
var usersRouter = require('./src/routes/users');
const classRouter = require('./src/routes/class');
const gradeRouter = require('./src/routes/grade');

var app = express();

Connect()
    .then(() => console.log("connect db success"))
    .catch(err => console.log("connect db faild: ", err))
Promise = global.Promise;

// view engine setup
app.use(cors())
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));



app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/class', classRouter)
app.use('/grade', gradeRouter)

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
