const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')

let User = require('../models/user')

// Add Articles Route
router.get('/register', function(req,res) {
	res.render('register',{
		title: 'Register'
	})
})

// Register Process

router.post('/register', function(req, res) {
	const name = req.body.name
	const email = req.body.email
	const username = req.body.username
	const password = req.body.password
	const password2 = req.body.password2

	req.checkBody('name', 'Name is required!').notEmpty();
	req.checkBody('email', 'Email is required!').notEmpty();
	req.checkBody('email', 'Email is not Valid!').isEmail();
	req.checkBody('username', 'User Name is required!').notEmpty();
	req.checkBody('password', 'Password is required!').notEmpty();
	req.checkBody('password2', 'Passwords Do not match!').equals(req.body.password);

	let errors = req.validationErrors();
	if(errors) {
		res.render('register', {
		errors: errors
		});
	}
	else {
		let newUser = new User({
			name: name,
			email: email,
			username: username,
			password: password,
			password2: password2
		});
		
		bcrypt.genSalt(10, function(err, salt){
			bcrypt.hash(newUser.password, salt, function(err, hash){
				if(err) {
					console.log(err)
				}
				newUser.password = hash;
				newUser.save(function(err) {
					if(err) {
					console.log(err)
					return;
					}
					else {
						req.flash('success', 'You are now register and can login!')
						res.redirect('/users/login')
					}
				})
			})
		})
	}
})


// Login Form
router.get('/login', function(req, res) {
	res.render('login')
})

// Login Process
router.post('/login', function(req, res,next) {
	 passport.authenticate('local', {
	   successRedirect: '/',
	   failureRedirect: '/users/login',
	   failureFlash: true 
	})(req, res, next)
})

// Logout
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'You are logout');
	res.redirect('/users/login')
})




module.exports = router;