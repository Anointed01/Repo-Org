module.exports = {
    ensureAuthenticated: (req, res, next)=>{
        if(req.isAuthenticated()){
            return next();
        } else{
            req.flash('authMsg', 'Please log in to view this page')
            res.redirect('/login')
        }
    }
    }