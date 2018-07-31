const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const expressValidator = require('express-validator')
const flash = require('connect-flash')
const session = require('express-session')
const config = require('./config/database')
const passport = require('passport')
mongoose.connect(config.database)
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


require('./config/passport')(passport);


// Passport Middleware
 app.use(passport.initialize());
  app.use(passport.session());

app.get('*', function(req, res, next){
	res.locals.user = req.user || null;
	next();
	console.log(req.user)
})


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

// Articles Routes
let articles = require('./routes/articles')
app.use('/articles', articles)

// Users Routes
let users = require('./routes/users')
app.use('/users', users)


// Start Server
app.listen(3000, ()=> {
console.log("Server has started on port 3000")
})