const express = require('express');
const nodemailer= require('nodemailer');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const {ensureAuthenticated, ensurePaymentOnly, ensureAdminOnly, ensureBranchAdmin} = require('../config/auth');
const { User } = require('../model/user');


router.get('/', (req, res)=>{
    res.render('register')
})







module.exports = router;