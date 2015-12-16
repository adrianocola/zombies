/*
 Tyle Type definition
 */


var TileTypeSchema = server.mongoose.Schema({
    name: String,
    original: Number,
    width: Number,
    height: Number,
    body: String,
    shadow: Boolean
});

module.exports = server.mongoose.model('TileType', TileTypeSchema);