var Tile = require("./Tile.js");

var RegionSchema = app.mongoose.Schema({
    pos: {type: [Number], index: {type: "2d", min: -1000000, max: 1000000}},
    tiles: [Tile.schema]
});

RegionSchema.statics.findOneByPos = function (x, y, cb) {

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
};

RegionSchema.statics.findInBox = function (topLeft, bottomRight, cb) {
    this.find({ pos: {$geoWithin : {
        $box : [topLeft, bottomRight]
    }}}, cb);
};

RegionSchema.statics.findInBoxes = function (box1, box2, cb) {
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
};

module.exports = app.mongoose.model('Region', RegionSchema);

