var client = require('ampersand-app');
var _ = global._ = require('lodash');
var $ = global.$ = require('jquery');

client.extend({
    models: {
        TileTypeModel: require('./models/tileTypeModel'),
        TileTypeCollection: require('./models/tileTypeCollection'),
        ThingTypeModel: require('./models/thingTypeModel'),
        ThingTypeCollection: require('./models/thingTypeCollection'),

        RegionModel: require('./models/regionModel'),
        RegionCollection: require('./models/regionCollection'),
        TileModel: require('./models/tileModel'),
        TileCollection: require('./models/tileCollection'),
        SlotModel: require('./models/slotModel'),
        SlotCollection: require('./models/slotCollection'),
        ThingModel: require('./models/thingModel'),
        ThingCollection: require('./models/thingCollection'),
        PlayerModel: require('./models/playerModel'),
        PlayerCollection: require('./models/playerCollection')
    },
    engine: {
        Events: require('./engine/events'),
        Game: require('./engine/game'),
        Map: require('./engine/map'),
        Tile: require('./engine/tile'),
        Thing: require('./engine/thing')
    },
    consts: require('../shared/consts')
});

$(function(){
    var game = new client.engine.Game({
        visibleTiles: client.consts.visibleTiles,
        regionTiles: client.consts.regionTiles,
        tileSize: client.consts.tileSize,
        slotSize: client.consts.slotSize
    });
    game.start();
    //var regions = new client.models.RegionCollection();
    //regions.fetch({data: {points: [{x:0,y:0}]}, success: function(coll,resp){
    //    //console.log(coll);
    //    console.log(coll.at(0).tiles.at(0).slots.at(0));
    //}});
});

// attach our app to `window` so we can
// easily access it from the console.
window.client = client;
