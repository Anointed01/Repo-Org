const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
    email: {
        type:String,
       unique: true
    },
    password: {
        type:String,
       
    },
    cpassword: {
        type:String,
       
    },
    firstName: {
        type:String,
       
    },
    lastName: {
        type:String,
       
    },
    gender: {
        type:String,
       
    },
    dob: {
        type:String,
       
    },
    phone: {
        type:String,
       
    },
    address: {
        type:String,
       
    },
    state: {
        type:String,
       
    },
    lga: {
        type:String,
    },
    registrationDate: {
        type:String,
       
    },
    status: {
        type: String,
        default: "inactive"
       
    }, 
    resetPasswordToken: {
        type:String,
       
    },
    resetPasswordExpires: {
        type:Date,
       
    }

});

const User = mongoose.model('User', userSchema);

module.exports = {User};