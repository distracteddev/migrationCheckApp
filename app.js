/**
 * Module dependencies.
 */

var express   = require('express')
  , http      = require('http')
  , path      = require('path')
  , partials  = require('express-partials')
  , app		  = express();

global.io = require('socket.io').listen(app.listen( process.env.PORT || 3000 ));

io.configure(function () {
	io.set('transports', ['websocket', 'xhr-polling']);
	io.set('log level', 0);
	io.set('force new connection', true);
});

io.sockets.on('connection', function (socket)
{
	socket.on('setMaxThreads', function(data){  });
});

app.configure(function() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	app.set('view options', { layout:true, pretty: true });
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.bodyParser());
	app.use(express.methodOverride());
	app.use(express.compress());
	app.use(partials());
	app.use(app.router);
	app.use('/csv', express.directory('csv'));
	app.use('/csv', express.static('csv'));
	app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
	app.use(express.errorHandler());
});

require('./routes')(app);
