
//**********
// GLOBALS
//**********
var _ = GLOBAL._ = require('lodash');
var express = require('express');
var app = GLOBAL.app = express();
var server = require('http').Server(app);

//**********
//   REDIS
//**********
var redisCli = require("redis");
var redis = app.redis = redisCli.createClient();

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
var multer  = require('multer');
var session = require('express-session');
var RedisStore = require('connect-redis')(session);

function compile_nib(str, path) {
    return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
}

app.set('views', './protected/views');
app.set('view engine', 'jade');
app.locals.basedir = './protected/views';

app.use(session({
    name: "session",
    store: new RedisStore({client: redis,prefix: 'ZTsess:'}),
    secret: 'zombietown',
    saveUninitialized: true,
    resave: true,
    cookie: { maxAge: 24*60*60*1000 } //1 day
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(favicon('./public/favicon.ico'));
app.use(stylus.middleware({ src: './public', compile: compile_nib}));
app.use(serveStatic('./shared'));
app.use(serveStatic('./public'));
app.use(serveStatic('./assets'));

//**********
//  SHARED
//**********
app.shared = require('./shared');

//**********
//    APP
//**********
app.services = require('./protected/services');
app.models = require('./protected/models');
app.routes = require('./protected/routes');

//**********
// SOCKET.io
//**********
var io = app.io = require('socket.io')(server);

io.on('connection', function (socket) {

});

//**********
//  GRUNT
//**********
var grunt = require('grunt');
var watch = require('watch');
grunt.tasks(['default'],{},function(){});

watch.watchTree('public/partials',function(){
    grunt.tasks(['default'],{},function(){});
});

//**********
//  START!
//**********
server.listen(4000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port);

});