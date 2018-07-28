const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')

mongoose.connect('mongodb://localhost/node-express')
const db = mongoose.connection;

// cehck connection 
db.once('open', function() {
	console.log('Connected to db')
})

// Check for db errors 
db.on('error', function(err) {
	console.log(err)
})
const app = express();
let Article = require('./models/article')
// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug')


app.use(express.static(path.join(__dirname, 'public')));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}))

// Express Message Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// Express Valiadtor middleware
app.use(express.json());
app.post('/user', (req, res) => {
  User.create({
    username: req.body.username,
    password: req.body.password
  }).then(user => res.json(user));
});

// Express Validator Middleware
app.use(expressValidator({
	errorFormatter: function(param, msg, value) {
		var namespace = param.split('.')
		, root = namespace.shift()
		, formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param: formParam,
			msg: msg,
			value: value
		};
	}
}));

// Home Route
app.get('/', function(req,res) {
	Article.find({}, function(err, articles) {
		if(err) {
			console.log(err)
		}
		else {
	res.render('index',{
		title: 'Articles',
		articles: articles
	})
		}
	})
})

// Get single route
app.get('/article/:id', function(req,res) {
	Article.findById(req.params.id, function(err, article) {
	res.render('article',{
		article: article
	})	
	})
})
// Add Articles Route
app.get('/articles/add', function(req,res) {
	res.render('add_article',{
		title: 'Add Articles'
	})
})
// Edit article form
app.get('/article/edit/:id', function(req,res) {
	Article.findById(req.params.id, function(err, article) {
	res.render('edit_article',{
		title: 'Edit Article',
		article: article
	})	
	})
})
app.delete('/article/:id', function(req,res) {
	let query = {_id: req.params.id};
	Article.remove(query, function(err) {
		if(err) {
			console.log(err)
		}
		req.flash('danger', 'Article Removed')
		res.send('Success')
	})
})
//  Add Submit POST Route
app.post('/articles/add', function(req,res) {
	req.checkBody('title', 'Title is required').notEmpty();
	req.checkBody('author', 'Author is required').notEmpty();
	req.checkBody('body', 'Body is required').notEmpty();

	let errors = req.validationErrors();

	if(errors) {
		res.render('add_article', {
			title: 'Add Article',
			errors: errors
		})
	}
	else {

	let article = new Article();
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;
	article.save(function(err) {
		if(err) {
			console.log(err)
			return;
		}
		else {
			req.flash('success', 'Article Added')
			res.redirect('/')
		}
	})
	}	
})
//  update article route
app.post('/article/edit/:id', function(req,res) {
	let article = {};
	article.title = req.body.title;
	article.author = req.body.author;
	article.body = req.body.body;
	let query = {_id:req.params.id}
	Article.update(query, article, function(err) {
		if(err) {
			console.log(err)
			return;
		}
		else {
			req.flash('info', 'Article Updated')
			res.redirect('/')
		}
	})	
})

// Start Server
app.listen(3000, ()=> {
console.log("Server has started on port 3000")
})