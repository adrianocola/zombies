
var _ = GLOBAL._ = require('lodash');
var express = require('express');
var app = GLOBAL.app = express();
var server = require('http').Server(app);

//aplication base dir
app.path = __dirname + "/../";

var stylus = require('stylus');
var nib = require('nib');

//express middlewares
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

app.engine('jade', require('jade').__express);

app.use(multer());
app.use(favicon('./public/favicon.ico'));
app.use(stylus.middleware({ src: './public', compile: compile_nib}));
app.use(serveStatic('./public'));

var models = require('./models');
var routes = require('./routes');

grunt.tasks(['default'],{},function(){});

watch.watchTree('public/partials',function(){
    grunt.tasks(['default'],{},function(){});
});

server.listen(4000, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Example app listening at http://%s:%s', host, port);

});