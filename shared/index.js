//THIS FILE SHOULD ONLY BE USED IN SERVER SIDE!


//dir.files(__dirname,function(err,files){
//    console.log(__dirname);
//    for(var i = 0; i<files.length; i++){
//        var filePath = files[i].replace(__dirname,'');
//        console.log(filePath);
//        var name = path.basename(filePath,'.js');
//        if(name!="index"){
//            app.shared[name] = GLOBAL[name] = require(files[i]);
//        }
//    }
//});


module.exports = require('require-directory')(module);