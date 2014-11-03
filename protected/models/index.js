
app.models = {};

var mongoose = app.mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/zombies');

module.exports = require('require-directory')(module);

