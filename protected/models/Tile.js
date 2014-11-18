var TileSchema = app.mongoose.Schema({
    pos: {type: [Number], index: '2d'},
    type:{ type: Number, required: true, index: true},
    face: Number // 0 = UP; 1 = RIGHT; 2 = DOWN, 3 = LEFT
});

app.models.Tile = app.mongoose.model('Tile', TileSchema);