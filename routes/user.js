const express = require('express');
const router = express.Router();
const nodemailer= require('nodemailer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const async = require('async');
const crypto = require('crypto');
const {ensureAuthenticated} = require('../config/auth');
require('dotenv').config();


const mailTransporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user:  `${process.env.SENDER_MAIL_ADD}`,
        pass: `${process.env.SENDER_MAIL_PASS}`
    }
});


// user model
const {User} = require('../model/user')
// membership registration

router.get('/', (req, res)=>{
    res.render('register')
});

// membership login
router.get('/login', (req, res)=>{
    res.render('login')
});
// membership dashboard
router.get('/dashboard', ensureAuthenticated, (req, res)=>{
    res.render('dashboard')
});
// forgot password
router.get('/forgot', (req, res)=>{
    res.render('member/forgot', {
        user: req.user
    })
});


router.post("/register", (req, res, next)=>{

    const {email,  password, cPassword, firstName, lastName, phone } = req.body;

    let errors = [];

    // check required fields
    if(!email || !password || !cPassword || !firstName ||!lastName ||!phone){
        errors.push({msg: 'Please fill in all fields'})
    }

       // check password match
if (password !== cPassword){
    errors.push({msg: 'Your password do not match'})
}

// check password length
if(password.length < 6){
    errors.push({msg: 'Password should be at least 6 characters'})
}

let today = new Date().toISOString().slice(0, 10);

if(errors.length > 0){
    res.render('register', {errors,
        email,
        password,
        cPassword,
        firstName,
        lastName,
        phone,
    })

} else{
    // Validation passed
    User.findOne({email:email})
    .then(user=>{
        if(user){
            // user exit
            errors.push({msg: 'Email already registered'})
            res.render('register', {errors,
                email,
                password,
                cPassword,
                firstName,
                lastName,
                phone,
            })
        } else{

            const newUser = new User({
                email,
                password,
                cPassword,
                firstName,
                lastName,
                phone,
                registrationDate: today,
            });
            // Hash Password
            bcrypt.genSalt(10, (err, salt)=>
            bcrypt.hash(newUser.password, salt, (err, hashpass)=>{
                if(err) throw err;
                // set password to hashed password
                newUser.password = hashpass;
                //save new user
                newUser.save()
                .then(user =>{
                    
                    async.waterfall([
                        function(done) {
                          crypto.randomBytes(20, function(err, buf) {
                            let token = buf.toString('hex');
                            done(err, token);
                          });
                        },
                        function(token, done) {
                          User.findOne({ email: req.body.email }, function(err, user) {
                            if (!user) {
                              req.flash('error', 'No account with that email address exists.');
                              return res.redirect('/forgot');
                            }
                    
                            user.resetPasswordToken = token;
                            user.resetPasswordExpires = Date.now() + 900000; // 15 minutes
                    
                            user.save(function(err) {
                              done(err, token, user);
                            });
                          });
                        },
                        function(token, user, done) {
                  
                          let mailOptions = {
                            to: `${user.email}`,
                            from: `${process.env.SENDER_MAIL_ADD}`,
                            subject: 'Gloove App',
                            text: `Dear{user.firstName}\n\n` +
                              "Dear" + user.firstName + '\n\n' +
                              "Please click on the following link, or paste this into your browser to verify your account\n\n"+
                              'http://' + req.headers.host + '/verify/' + token + '\n\n' +
                              'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                          };
                          mailTransporter.sendMail(mailOptions, function(err) {
                            req.flash('info', 'An e-mail has been sent to ' + user.email + ' please activate your with the link sent to you.');
                            done(err, 'done');
                          });
                        }
                      ], function(err) {
                        if (err) return next(err);
                        res.redirect('/register');
                      });
      
                })
                .catch(err=>{
                    console.log(err);
                })
            }))
        }
        })
    }
})

//Activate account
router.get('/verify/:token', function(req, res) {
    User.updateOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, {$set:{status:"active"}})
    .then(user=>{
        req.flash('error', 'Your account has been activated.');
        return res.redirect('/login');
    })
  });

  // Login handle
router.post('/login',
passport.authenticate('user', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
}));

//Logout handle
router.get('/logout', (req, res)=>{
req.logout((err)=>{
    if(err){return (err); }

    req.flash('logOutMsg', 'You have logged out');
res.redirect('/login');
});

});



        

module.exports = router;