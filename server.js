const express = require('express');
const ejs = require('ejs');
const _ = require('lodash');
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');

require('dotenv').config();

const app = express();

//passport config
require('./config/passport')(passport);

// db configuration
const db = require('./config/keys').mongoURI;

//connection to mongo
mongoose.connect(db,{useNewUrlParser:true})
.then(()=>{
    console.log('database successfully connected');
})
.catch(err=>{
    console.log(err);
})

//EJS
app.set('view engine', 'ejs');

//Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());


//Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 10 * 60 * 1000 } 
  }));

//   passport middleware
app.use(passport.initialize());
app.use(passport.session());

  //Connect flash
  app.use(flash());

//   Global vars
app.use((req, res, next)=>{
    res.locals.successMsg = req.flash('successMsg');
    res.locals.errorMsg = req.flash('errorMsg');
    res.locals.logOutMsg = req.flash('logOutMsg');
    res.locals.authMsg = req.flash('authMsg');
    res.locals.error = req.flash('error');
    next();
});

app.use('/', require('./routes/index'))
app.use('/', require('./routes/user'))

app.listen(3000, ()=>{
    console.log("server is running on port 3000");
})