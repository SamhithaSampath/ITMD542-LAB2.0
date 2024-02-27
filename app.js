console.log('Current working directory:', process.cwd());
const express = require('express');
const path = require('path');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');

const index = require('./routes/index.js');
const contacts = require('./routes/contacts');

const app = express();

// Example configuration in app.js
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



// middleware setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'));

// routes setup
app.use('/', index);
app.use('/contacts', contacts);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler
app.use((err, req, res, next) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.render('error'); // Corrected the path to the error template
  });
  


// Start the server on port 4000
app.listen(4000, () => console.log('Server is running on port 4000'));

module.exports = app;