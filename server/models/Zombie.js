var Thing = require("./Thing.js");

var ZombieSchema = server.mongoose.Schema({

});

module.exports = Thing.discriminator('Zombie', ZombieSchema);