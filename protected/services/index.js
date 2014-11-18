var dir = require('node-dir');
var path = require('path');

app.services = {};

dir.files(__dirname,function(err,files){
    for(var i = 0; i<files.length; i++){
        var name = path.basename(files[i],'.js');
        if(name!="index"){
            app.services[name] = GLOBAL[name] = require(files[i]);
        }
    }
});


module.exports = require('require-directory')(module);