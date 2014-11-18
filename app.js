
var _ = GLOBAL._ = require('lodash');
var express = require('express');
var app = GLOBAL.app = express();
var server = require('http').Server(app);

var stylus = require('stylus');
var nib = require('nib');

//express middlewares
var bodyParser = require('body-parser')
var serveStatic = require('serve-static');
var favicon = require('serve-favicon');
var multer  = require('multer');

var io = app.io = require('socket.io')(server);
var mongoose = app.mongoose = require('mongoose');
var grunt = require('grunt');
var watch = require('watch');

function compile_nib(str, path) {
    return stylus(str)
        .set('filename', path)
        .set('compress', true)
        .use(nib());
}

app.set('views', './protected/views');
app.set('view engine', 'jade');
app.locals.basedir = './protected/views';

app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer());
app.use(favicon('./public/favicon.ico'));
app.use(stylus.middleware({ src: './public', compile: compile_nib}));
app.use(serveStatic('./public'));
app.use(serveStatic('./assets'));

require('./protected/services');
require('./protected/models');
require('./protected/routes');

grunt.tasks(['default'],{},function(){});

watch.watchTree('public/partials',function(){
    grunt.tasks(['default'],{},function(){});
});

server.listen(4000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port);

});