var express = require('express');

var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
const { check, validationResult } = require('express-validator/check');
const { matchedData, sanitize } = require('express-validator/filter');
var loggedInUsers=[];

var uniqueValidator = require('mongoose-unique-validator');

var User = require('../models/user');


// Register
router.get('/register', function(req, res){
	res.render('register');
});

// Login
router.get('/login', function(req, res){
	res.render('login');
});

// Register User
router.post('/register', function(req, res){

	var email = req.body.email;
	var username = req.body.username;
	var password = req.body.password;
	var password2 = req.body.password2;

	// Validation
	
	
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	// req.checkBody('username', 'this user name is already used').custom(
	// 			function(username) {
	// 					return 	User.getUserByUsername(username, function(err, user){
	// 						if(user){
	// 							return err;
	// 						}
	// 			})
	// 	}
	// );

	req.checkBody('username', 'Username is required').notEmpty();
	
	
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();
	
//check if the use exists name and email


	if(errors){
		res.render('register',{
			errors:errors
		});
	} else {
		var newUser = new User({

			email:email,
			username: username,
			password: password,
			});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');

		res.redirect('/users/login');
	}
});

passport.use(new LocalStrategy(
  function(email, password, done) {
   User.getUserByEmail(email, function(err, user){
   	if(err) throw err;
   	if(!user){
   		return done(null, false, {message: 'Unknown User'});
   	}

   	User.comparePassword(password, user.password, function(err, isMatch){
   		if(err) throw err;
   		if(isMatch){
			    //push logged in user email to array 
				onlineUsers= loggedInUsers.push(email);
				//updateOnlineUsers(onlineUsers);
				
   console.log('list of logged inusers')
	 /// console.log('list of loged inusers : ',email)
	 loggedInUsers.map(function(x){
		 console.log(x);
	 })
	 console.log("======================");
   
   			return done(null, user);
   		} else {
   			return done(null, false, {message: 'Invalid password'});
   		}
   	});
   });
  
  }));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local', {successRedirect:'/', failureRedirect:'/users/login',failureFlash: true}),
  function(req, res) {
    res.redirect('/');
  });

router.get('/logout', function(req, res){
	
	// remove the logged out user fro the array.
	var em=req.user['email'];
	var index = loggedInUsers.indexOf(em);
	if (index > -1) {
		loggedInUsers.splice(index, 1);
		
	}
	//updateOnlineUsers(onlineUsers);
	console.log('the user with the email:',em,' has been logged out')
	if (loggedInUsers.length>0){	
		loggedInUsers.map(function(x){
		console.log('loged in user',x);
		
		})
	}else{console.log('their is no user loggedin')}
	req.logout();


	req.flash('success_msg', 'You are logged out');

	res.redirect('/users/login');
});
// function updateOnlineUsers(onlineUsers){
// 	return onlineUsers;
// }

module.exports = router;//
module.exports.usersEmails  =loggedInUsers;