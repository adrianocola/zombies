var Thing = require("./Thing.js");

var ZombieSchema = app.mongoose.Schema({

});

module.exports = Thing.discriminator('Zombie', ZombieSchema);