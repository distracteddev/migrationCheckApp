/*
 * Routes handlers
 */

var exec = require('child_process').exec,
	child_process = require('child_process'),
	db = require('dirty'),
	urlUtil = require('url');
	fs 			  = require('fs'),

	child_processes = [];


db = db('results');

db.on('load', function() {
	console.log('DB LOADED');
})

module.exports = function(app) {
	app.get("/", getHomePage);
	app.post("/run", runComparison);
	app.get("/results/:id", getResult);
}

function getResult(req, res) {
	res.render('result', {
		id: req.params.id,
		data: db.get(req.params.id)
	});
}

function getHomePage(req, res) {
	function testEmit() {
		console.log("Testing Emit");
		io.sockets.emit('result', {
			url: 'http://test.url.com/',
			id: 'test.url.com_1231313213',
			href: '/results/test.url'
		});
	}

	var previousResults = []
	// setTimeout(testEmit, 2000);
	db.forEach(function(key, val) {
		previousResults.push({
			id: key,
			url: val.baseUrl,
			href: '/results/' + key
		})
	});

	console.log(previousResults);

	res.render('index', {
		previousResults: previousResults
	});
}

function runComparison(req, res) {
	var url   	 = req.body.url,
		scUrl1	   = req.body.scUrl1,
		scUrl2	   = req.body.scUrl2,
		clientId   = parseInt(req.body.clientId),
		baseUrl    = req.body.baseUrl,
		limit 	   = parseInt(req.body.limit),
	  Crawl					= require('migrationCheck').Crawl,
		Comparison = require('migrationCheck').Comparison;


	Crawl(baseUrl, limit, function (urls) {
		var comp = new Comparison(scUrl1, scUrl2, clientId, urls);

		var id = urlUtil.parse(baseUrl).hostname + '_' + Date.now();

		// once we're done...
		comp.on('complete', function(results) {
			// Save the result
			db.set(id, {
				baseUrl: baseUrl,
				scUrl1: scUrl1,
				scUrl2: scUrl2,
				clientId: clientId,
				result: results
			}, function() {
				console.log('Saved result', id);
			});

			// Emit the result
			io.sockets.emit('result', {
				url: baseUrl,
				id: id,
				href: '/results/' + id
			});
		});

		// lift-off...
		comp.start();
	});

	res.redirect("/");
}