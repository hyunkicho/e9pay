const express = require('express');
const router = express.Router();
const passport = require('passport');
const JSONResponse = dicontainer.get( "JSONResponse" );

router.get('/login', function(req, res, next){
  res.render('login');
});

router.get('/signup', function(req, res, next){
	res.render('user/signup');
  });

router.post('/loginprocess', passport.authenticate('local-login', {
	failureRedirect : '/login',
	failureFlash : true
}), function(req,res){
		res.redirect("/");
});

router.post('/signupprocess', passport.authenticate('local-join', {
	failureRedirect : '/signup',
	failureFlash : true
}), function(req,res){
		res.redirect("/");
});

router.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
  });

module.exports = router;
