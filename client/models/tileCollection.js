var AmpersandCollection = require('ampersand-rest-collection');
var Tile = require('./tileModel');

module.exports = AmpersandCollection.extend({
    model: Tile,
    url: '/api/editor/tiles/',
    tileMap: {},
    initialize: function(){

        this.on('add',this.onAdd);
        this.on('remove',this.onRemove);

    },

    onAdd: function(tile){
        this.tileMap[tile.getId()] = tile;
    },

    onRemove: function(tile){
        delete this.tileMap[tile.getId()];
    },

    getByPos: function(x,y){
        return this.tileMap[TileModel.generateId(x,y)];
    }
});