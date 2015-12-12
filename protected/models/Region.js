var Tile = require("./Tile.js");

var RegionSchema = app.mongoose.Schema({
    pos: {type: [Number], index: true},
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

RegionSchema.statics.insertInEmptySlotStand = function (tileX, tileY, slot, entity, cb) {

    var regionPos = app.services.Map.regionPosByTile(tileX,tileY);
    var tileIndex = app.services.Map.tileArrayIndex(tileX,tileY);
    var path = 'tiles.' + tileIndex + '.slots.' + slot + '.stand';

    var query = {pos: regionPos};
    query[path] = {$exists: false};

    var update = {};
    update[path] = entity;

    app.models.Region.update(query,update,cb);

};

RegionSchema.statics.clearSlotStand = function (tileX, tileY, slot, cb) {

    var regionPos = app.services.Map.regionPosByTile(tileX,tileY);
    var tileIndex = app.services.Map.tileArrayIndex(tileX,tileY);
    var path = 'tiles.' + tileIndex + '.slots.' + slot + '.stand';

    var query = {pos: regionPos};

    var update = {$unset: {}};
    update.$unset[path] = 1;

    app.models.Region.update(query,update,cb);

};


module.exports = app.mongoose.model('Region', RegionSchema);

