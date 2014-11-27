var TileSchema = app.mongoose.Schema({
    pos: {type: [Number], index: {type: "2d", min: -1000000, max: 1000000}},
    things: [{
        thing: { type: app.mongoose.Schema.ObjectId, ref: 'Thing'},
        place: Number //1 to 9
    }],
    type:{ type: Number, required: true, index: true},
    face: Number // 0 = UP; 1 = RIGHT; 2 = DOWN, 3 = LEFT
});

TileSchema.statics.findOneByPos = function (x, y, cb) {

    if(x instanceof Array){
        cb = y;
        y = x[1];
        x = x[0];
    }

    this.find({ pos: {$geoWithin : {
        $box : [[x, y], [x, y]]
    }}}, function(err,tile){

        if(err || !tile || tile.length===0) cb(err,tile);

        cb(err,tile[0]);

    });
}

TileSchema.statics.findInBox = function (topLeft, bottomRight, cb) {
    this.find({ pos: {$geoWithin : {
        $box : [topLeft, bottomRight]
    }}}, cb);
}

TileSchema.statics.findInBoxes = function (box1, box2, cb) {
    this.find({ $or: [
        {
            pos: {
                $geoWithin: {
                    $box: [box1[0], box1[1]]
                }
            }
        },
        {
            pos: {
                $geoWithin: {
                    $box: [box2[0], box2[1]]
                }
            }
        }
    ]}, cb);
}

module.exports = app.mongoose.model('Tile', TileSchema);

