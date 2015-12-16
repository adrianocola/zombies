/*
    Indicates everything that can be seen or used
    Players, Zombies, Items, etc
 */


var ThingSchema = server.mongoose.Schema({
    name: String,
    type: {type: Number}, //ver thingTypes
    entity: {type: String, default: 'Thing'},
    size: Number //1 small, 2 medium, 3 big
});

module.exports = server.mongoose.model('Thing', ThingSchema);