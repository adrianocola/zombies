var Slot = require('./Slot.js');

var TileSchema = server.mongoose.Schema({
    _id: false,
    x: Number,
    y: Number,
    slots: [Slot.schema],
    type:{ type: Number, required: true},
    face: Number // 0 = UP; 1 = RIGHT; 2 = DOWN, 3 = LEFT
});

module.exports = server.mongoose.model('Tile', TileSchema);



