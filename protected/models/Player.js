var Thing = require("./Thing.js");

var PlayerSchema = app.mongoose.Schema({

});

module.exports = Thing.discriminator('Player', PlayerSchema);