var Thing = require("./Thing.js");

var PlayerSchema = app.mongoose.Schema({
    inventory: [{ type: app.mongoose.Schema.ObjectId, ref: 'Thing'}]
});

module.exports = Thing.discriminator('Player', PlayerSchema);