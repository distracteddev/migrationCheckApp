/*
 * Routes handlers
 */

var exec        = require('child_process').exec,
	child_process = require('child_process'),
	db            = require('dirty'),
	urlUtil       = require('url'),
	fs 			      = require('fs'),
	Crawl					= require('migrationCheck/newCrawler'),
	Comparison    = require('migrationCheck/compare');


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
	var data = db.get(req.params.id);
	res.render('result', {
		id: req.params.id,
		// data: db.get(req.params.id)
		data: data
	});
}

function getHomePage(req, res) {

	var previousResults = []
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
	var scUrl1	   = req.body.scUrl1,
		  scUrl2	   = req.body.scUrl2,
		  clientName = req.body.clientName,
		  clientId   = parseInt(req.body.clientId),
		  baseUrl    = req.body.baseUrl,
		  limit 	   = parseInt(req.body.limit);

	if (clientName) {
		scUrl1 = 'https://nexus.ensighten.com/' + clientName +'/serverComponent.php';
		scUrl2 = 'https://nexus3.ensighten.com/' + clientName +'/serverComponent.php';
	}

	console.log('Starting to Crawl', baseUrl);

	Crawl(baseUrl, limit, function (urls) {
		var comp = new Comparison(scUrl1, scUrl2, clientId, urls);

		console.log('Starting Comparison', baseUrl);
		comp.silent = true;
		comp.writeToFile = true;

		var id = urlUtil.parse(baseUrl).hostname + '_' + Date.now();
		comp.fileName = 'csv/' + id + '.txt';

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

			// write csv

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