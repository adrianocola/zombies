/*
    Indicates everything that can be seen or used
    Players, Zombies, Items, etc
 */


var ThingSchema = app.mongoose.Schema({
    name: String,
    type: {type: String}, //player,zombie,item,etc
    size: Number //1 small, 2 medium, 3 big
});

module.exports = app.mongoose.model('Thing', ThingSchema);