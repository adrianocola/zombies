
app.models = {};

var mongoose = app.mongoose = require('mongoose');

if(process.env.NODE_ENV === "prod"){

    mongoose.connect('mongodb://admin:admin@localhost/zombies');

}else{
    mongoose.connect('mongodb://localhost/zombies');
}



module.exports = require('require-directory')(module);

