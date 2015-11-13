/*
 Tyle Type definition
 */


var TileTypeSchema = app.mongoose.Schema({
    name: String,
    original: Number,
    width: Number,
    height: Number,
    body: String,
    shadow: Boolean
});

module.exports = app.mongoose.model('TileType', TileTypeSchema);