const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Load user model
const {User} = require('../model/user');

module.exports = function(passport){
    passport.use('user',
        new LocalStrategy({usernameField: 'phone', passReqToCallback: true}, (req, phone, password, done)=>{
            //match User
            User.findOne({phone: phone})
            .then(user=>{
                if(!user){
                    return done(null, false, { message: 'This phone is not registered'});
                }
                if(user.status!=="active"){
                    return done(null, false, { message: 'This account is not activated yet'});
                }
                //match password
                bcrypt.compare(password, user.password, (err, isMatch)=>{
                    if(err) throw err;

                    if (isMatch){
                        return done(null, user);
                    } else{
                        return done(null, false, { message: 'password incorrect'});
                    }
                });
            })
            .catch(err=>{
                console.log(err);
            });
        })
    );



function SessionConstructor(userId, userGroup, details) {
    this.userId = userId;
    this.userGroup = userGroup;
    this.details = details;
}

passport.serializeUser(function (userObject, done) {
    // userObject could be a Model1 or a Model2... or Model3, Model4, etc.
    let userGroup = "user";
    let userPrototype =  Object.getPrototypeOf(userObject);
  
    if (userPrototype === User.prototype) {
        userGroup = "user";
    } 

    let sessionConstructor = new SessionConstructor(userObject.id, userGroup, '');
    done(null,sessionConstructor);
});

passport.deserializeUser(function (sessionConstructor, done) {

    if (sessionConstructor.userGroup == 'user') {
        User.findOne({
            _id: sessionConstructor.userId
        }, '-localStrategy.password', function (err, user) { // When using string syntax, prefixing a path with - will flag that path as excluded.
            done(err, user);
        });
    } 

});

}