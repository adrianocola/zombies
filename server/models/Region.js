var Tile = require("./Tile.js");

var RegionSchema = server.mongoose.Schema({
    x: Number,
    y: Number,
    tiles: [Tile.schema]
});

RegionSchema.index({ x: 1, y: 1 }, { unique: true });

RegionSchema.statics.insertInEmptySlotStand = function (tileX, tileY, slot, entity, cb) {

    var regionXY = shared.mapHelper.regionXYByTileXY(tileX,tileY);
    var tileIndex = shared.mapHelper.tileArrayIndex(tileX,tileY);
    var path = 'tiles.' + tileIndex + '.slots.' + slot + '.stand';

    var query = {x: regionXY.x, y: regionXY.y};
    query[path] = {$exists: false};

    var update = {};
    update[path] = entity;

    server.models.Region.update(query,update,cb);

};

RegionSchema.statics.clearSlotStand = function (tileX, tileY, slot, cb) {

    var regionXY = shared.mapHelper.regionXYByTileXY(tileX,tileY);
    var tileIndex = shared.mapHelper.tileArrayIndex(tileX,tileY);
    var path = 'tiles.' + tileIndex + '.slots.' + slot + '.stand';

    var query = {x: regionXY.x, y: regionXY.y};

    var update = {$unset: {}};
    update.$unset[path] = 1;

    server.models.Region.update(query,update,cb);

};


module.exports = server.mongoose.model('Region', RegionSchema);

