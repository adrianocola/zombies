var TileSchema = app.mongoose.Schema({
    pos: {type: [Number], index: '2d'},
    things: [{
        thing: { type: app.mongoose.Schema.ObjectId, ref: 'Thing'},
        place: Number //1 to 9
    }],
    type:{ type: Number, required: true, index: true},
    face: Number // 0 = UP; 1 = RIGHT; 2 = DOWN, 3 = LEFT
});

module.exports = app.mongoose.model('Tile', TileSchema);