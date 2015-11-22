var thing = require('./Thing.js');

var TileSchema = app.mongoose.Schema({
    _id: false,
    pos: [Number],
    things: {},
    type:{ type: Number, required: true},
    face: Number // 0 = UP; 1 = RIGHT; 2 = DOWN, 3 = LEFT
});

TileSchema.statics.getRegionByTileId = function (id) {
    var splitId = id.split(':');
    return [Math.floor(splitId[0]/11),Math.floor(splitId[1]/11)];
};

TileSchema.statics.getArrayIndexByTileId = function (id) {
    var splitId = id.split(':');
    return (splitId[0]%11)*11 + splitId[1]%11;
};

module.exports = app.mongoose.model('Tile', TileSchema);

