
app.models = {};

var mongoose = app.mongoose = require('mongoose');

if(process.env.NODE_ENV === "prod"){

    mongoose.connect('mongodb://zombies:zombies@localhost/zombies');

}else{
    mongoose.connect('mongodb://localhost/zombies');
}

mongoose.connection.on('connected', function() {
    app.log.info('Connected to MongoDB!');
});


module.exports = require('require-directory')(module);

