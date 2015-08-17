// require the path module
var path = require("path");
// require express and create the express app
var express = require("express");
var app = express();
// require bodyParser since we need to handle post data for adding a user
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded());
// static content
app.use(express.static(path.join(__dirname, "./static")));
// set the views folder and set up ejs
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');
// listen on 3333
var server = app.listen(3333, function() {
	console.log("listening on port 3333")
})

var mongoose = require('mongoose');
// This is how we connect to the mongodb using mongoos -- "basic_mongoose" is the name of our db in mongodb -- this should match the name of the db you are to use for your project
mongoose.connect('mongodb://localhost/basic_mongoose');

var UserSchema = new mongoose.Schema( {
	name: String, 
	age: Number
})

var User = mongoose.model('User', UserSchema);

var io = require('socket.io').listen(server);
var passusers = '';

// root route
app.get('/', function(req, res) {
	User.find({}, function(err, users){
		console.log(users);
		passusers = users;
		if (err)
		{
			console.log('could not get users')
		}
		else {
			
		}
	})
	// This is where we would get the users from the database and send them to the index view to be displayed.
	res.render('index');
})

io.sockets.on('connection', function(socket) {
	console.log('WE ARE USING SOCKETS!');
	console.log(socket.id);
	socket.emit('mongo_users', passusers);
})

// route to add a user
app.post('/users', function(req, res) {
	console.log("POST DATA", req.body);
	// create a new User with the name and age corresponding to those from req.body
	var user = new User({name: req.body.name, age: req.body.age});
	// try to save that new user to the database (this is the method that actually inserts into the db) and run a callback function with an error (if any) from the operation.
	user.save(function(err) {
		//if there is an error console.log that something went wrong!
		if(err)
		{
			console.log('something went wrong');
		}
		else
		{
			console.log('successfully added a user!');
			res.redirect('/');
		}
	})
})