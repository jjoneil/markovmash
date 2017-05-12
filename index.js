/*
	Setting Up Express Server App
*/

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var fs = require('fs');
var Twitter = require('Twitter');

var secret = require('./secret.js');

var client = new Twitter(secret);

var markov = require('./markov.js');

app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

/*
	Adding Middleware to Express Server App
*/

app.use(function(req, res, next) {
	console.log(req.url);
	next();
});

//initial get to access all of the tweets from markov
app.get('api/tweets/:user', function(req, res){
	var username = req.params.user;
	if(!username){
		res.send("oh no, there was no username!");
		return;
	}
	//pulling straight from https://www.npmjs.com/package/twitter
	var params = {
		screen_name: 'username',
		include_rts: false,
		count: 200,
		contributor_details: false,
		trim_user: true
	};

	client.get('statuses/user_timeline', params, function(error, tweets, response) {
	  if (!error) {
	    res.send(tweets.map(function(tweet){
	    	return tweet.txt;
	    }));
	    for (var i = 0; i < tweets.length; i++) {
	    	markov.train(tweets[i]);
	    }
	    res.send(markov.generate(140));
	  } else {
	  	console.log(error);
	  	res.send("oops, there was an error");
	  }
	});
});

app.use(express.static('public'));

/*
	Error Handling Middleware
*/

app.use(function(req, res, next) {
	res.status(404);
	res.send("404 File Not Found 📃");
});

app.use(function(err, req, res, next) {
	console.log(err);
	res.status(500);
	res.send("500 Internal Server Error 💩");
});

/*
	Starting the Express Server
*/

app.listen(8000, function() {
	console.log("Server started: http://localhost:8000 ⚡️");
});