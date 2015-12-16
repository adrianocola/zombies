
//**********
// GLOBALS
//**********
var express = require('express');
GLOBAL._ = require('lodash');
GLOBAL.server = express();
var httpServer = require('http').Server(server);
server.shortId = require('shortId');

//**********
//  SHARED
//**********
GLOBAL.shared = require('./shared');

//**********
//   LOG
//**********
var winston = server.log = require('winston');
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, {colorize: true});
winston.level = 'error';

//**********
//   REDIS
//**********
var redisCli = require("redis");
var redis = server.redis = redisCli.createClient();

redis.on("error", function (err) {
    console.log("Error " + err);
});

redis.on("connect", function () {
    console.log("Connected to Redis!");
});


//**********
//  EXPRESS
//**********
var stylus = require('stylus');
var nib = require('nib');

//express middlewares
var bodyParser = require('body-parser');
var serveStatic = require('serve-static');
var favicon = require('serve-favicon');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);
var compression = require('compression');

var sessionStore = session({
    name: "session",
    store: new RedisStore({client: redis,prefix: 'ZTsess:'}),
    secret: 'zombietown',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 24*60*60*1000 } //1 day
});

//function compile_nib(str, path) {
//    return stylus(str)
//        .set('filename', path)
//        .set('compress', true)
//        .use(nib());
//}

server.set('views', './server/views');
server.set('view engine', 'jade');
server.locals.basedir = './server/views';


server.use(compression());
server.use(sessionStore);
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use(favicon('./public/favicon.ico'));
//app.use(stylus.middleware({ src: './client/styles', compile: compile_nib}));
server.use('/shared',serveStatic('./shared'));
server.use(serveStatic('./public'));
server.use(serveStatic('./assets'));

//**********
//    APP
//**********
server.consts = _.extend(require('./shared/consts'),require('./server/config/consts'));
server.services = require('./server/services');
server.models = require('./server/models');
server.routes = require('./server/routes');

//**********
// SOCKET.io
//**********

var getSession = function(handshake,cb){
    cb = cb || function(){};
    sessionStore(handshake, {}, function (err) {
        cb(err,handshake.session);
    });
}

var io = server.io = require('socket.io')(httpServer);
io.adapter(require('socket.io-redis')(redis));
io.on('connection', function (socket) {

    socket.data = {};

    socket.on(shared.events.ENTER_REGION,function(region_id){
        server.log.debug("ENTER REGION: " + region_id);
        socket.join(region_id);
    });

    socket.on(shared.events.LEAVE_REGION,function(region_id){
        server.log.debug("LEAVE REGION: " + region_id);
        socket.leave(region_id);
    });

});

//**********
//  MOONBOOTS
//**********

var Moonboots = require('moonboots-express');
var stylizer = require('stylizer');
var templatizer = require('templatizer');

var isDev = false;

if (!isDev) {
    templatizer('./templates', './client/templates.js',function(){});
    stylizer({
        infile: './client/styles/app.styl',
        outfile: './client/styles/app.css',
        development: isDev
    });
}


new Moonboots({
    moonboots: {
        jsFileName: 'zt',
        cssFileName: 'zt',
        main: './client/client.js',
        developmentMode: isDev,
        libraries: [
            './client/vendor/logger.min.js',
            './client/vendor/phaser_2.4.4.js'
        ],
        stylesheets: [
            './client/styles/vendor/bootstrap.css',
            './client/styles/app.css'
        ],
        sourceMaps: isDev,
        browserify: {
            debug: isDev
        },
        minify: !isDev,
        beforeBuildJS: function (done) {
            // This re-builds our template files from jade each time the app's main
            // js file is requested. Which means you can seamlessly change jade and
            // refresh in your browser to get new templates.
            if (isDev) {
                templatizer('./templates', './client/templates.js',done);
            }else{
                done();
            }
        },
        beforeBuildCSS: function (done) {
            // This re-builds css from stylus each time the app's main
            // css file is requested. Which means you can seamlessly change stylus files
            // and see new styles on refresh.
            if (isDev) {
                stylizer({
                    infile: './client/styles/app.styl',
                    outfile: './client/styles/app.css',
                    development: isDev
                }, done);
            } else {
                done();
            }
        }
    },
    appPath: "/app",
    server: server,
    render: function(req,res){
        if(req.session.player) return res.render('index2',{locals: res.locals, player: req.session.player});
        else return res.redirect('/login');
    }
});

//**********
//  START!
//**********
httpServer.listen(4000, function () {

    var host = httpServer.address().address;
    var port = httpServer.address().port;

    console.log('Zombies eating brains at http://%s:%s', host, port);

});