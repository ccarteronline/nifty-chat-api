//server.js

//BASE SETUP
//===================================

//call the packages we need
var express		= require('express');
var app			= express();
var bodyParser	= require('body-parser');

var mongoose	= require('mongoose');
var dbUrl		= 'mongodb://localhost:27017/test';
mongoose.connect(dbUrl);
var msgModel		= require('./app/models/ncMsg');
var Admin       = require('./app/models/admin');

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
//configure app to use body parser
//this will allow us to get data from post
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 3000;	//set port

//Routes for the api
var router = express.Router();		//get an instance of the express router

router.use(function (req, res, next) {
	//do logging
	console.log('Something is happening');
	console.log('A person has origin from: ', req.headers.origin);
	next();//make sure we go to the next routes and dont stop here
});

//test route to make sure everything is working
//(accessed at GET http://localhost:3000/api)
router.get('/', function (req, res) {
	res.json({ message: 'Welcome to the node api' });
});

//more routes for the api will happen here
router.route('/destory')
	.post(function (req, res) {
		// var username = req.body.username;
		// var password = req.body.password;

		// if (username === undefined || password === undefined || username === '' || password === '') {
		// 	res.json({ message: 'ERROR: You must define a username and password'});
		// } else {
		// 	//Check DB to make sure that admin is correct
		// 	res.json({ message: 'Username: '+ username+ 'password: '+ password });
		// }

		//For now delete all of the users in the table but later on check to see if the users exists
		// mongoose.connection.collections['test'].drop( function(err) {
		// 	res.json({ message: 'All messages and admins dropped in: test'});
		//     console.log('All messages and admins dropped in: test');
		// });

		// res.json({ message: 'All messages and admins dropped in: test'});

		// console.log('Hello there.');

		mongoose.connect(dbUrl, function (){
			//Drop the DB
			mongoose.connection.db.dropDatabase();
			res.json({ message: 'All the messages and admins dropped in: test' });
		});
});

router.route('/admin')
	.post(function (req, res) {
		var admin = new Admin();
		var username = req.body.username;
		var password = req.body.password;

		admin.username = username;
		admin.password = password;

		if (username === undefined || password === undefined || username === '' || password === '') {
			res.json({ message: 'ERROR: You must define a username and password'});
		} else {
			//Check DB to make sure that admin is correct
			admin.save(function (err) {
				if (err){
					res.send(err);
				} else {
					console.log('Created new administrator');
					res.json({ message: 'Admin Created!' });
				}

			});
		}
	})
	.get(function (req, res) {
		Admin.find(function (err, admins) {
			if (err) {
				res.send(err);
			} else {
				res.json(admins);
			}
		});
	});

//Remove the administrator by id
router.route('/admin/:admin_id')

	.delete(function (req, res) {
		Admin.remove({
			_id: req.params.admin_id
		}, function (err, ncMsg) {
			if (err) {
				res.send(err);
			}
			res.json({ message:'Successfully deleted' });
		});
	});


//get 
router.route('/messages')

	.post(function (req, res) {
		var mModel = new msgModel();	//create a new instance of the ncMsg model
		mModel.username = req.body.username;	//set the ncMsgs name (comes from the request)
		mModel.message = req.body.message;

		//save the ncMsg and check for errors
		mModel.save(function (err) {
			if (err){
				res.send(err);
			} else {
				res.json({ message: 'Message Created!' });
			}

		});

	})
	//get all the ncMsgs (accessed at GET http://localhost:8080/api/ncMsgs)
	.get(function (req, res) {
		msgModel.find(function (err, msgs) {
			if (err) {
				res.send(err);
			} else {
				res.json(msgs);
			}
		});
	});
//on routes that end in /ncMsgs/:ncMsg_id
//-----------------------------------------------------
router.route('/messages/:msg_id')

	//get the ncMsg with that id
	.get(function (req, res) {
		msgModel.findById(req.params.msg_id, function (err, msg) {
			if (err){
				res.send(err);
			} else {
				res.json(msg);
			}
		});
	})
	//update the ncMsg with this id
	.put(function (req, res) {
		msgModel.findById(req.params.msg_id, function (err, msg) {
			if (err) {
				res.send(err);
			} else {
				msgModel.username = req.body.username;
				msgModel.message = req.body.message;

				msgModel.save(function (err) {
					if (err) {
						res.send(err);
					} else {
						res.json({ message: 'message Updated!' })
					}
				});
			}
		});
	})

	.delete(function (req, res) {
		msgModel.remove({
			_id: req.params.msg_id
		}, function (err, msg) {
			if (err) {
				res.send(err);
			}
			res.json({ message:'Successfully deleted:'});
		});
	});


//REGISTER OUR ROUTES ---------------------------------
//all of the routes will be prefixed with /api
app.use('/api', router);

//START THE server
//=====================================================
app.listen(port);
console.log('The API is running on port: ', port);
