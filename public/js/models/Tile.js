
var TileModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){

    },

    getUniquePos: function(){
        return this.buildUniquePos(this.get('x'),this.get('y'));
    },

    buildUniquePos: function(x,y){
        return x + ":" + y;
    }

});

var TilesCollection = Backbone.Collection.extend({
    model: TileModel,

    url: '/api/editor/tiles/',
    tilePosMap: {},

    initialize: function(){

        this.on('add',this.onAdd);
        this.on('remove',this.onRemove);

    },

    onAdd: function(tile){
        this.tilePosMap[tile.getUniquePos()] = tile;
    },

    onRemove: function(tile){
        delete this.tilePosMap[tile.getUniquePos()];
    },

    getByPos: function(x,y){
        return this.tilePosMap[TileModel.buildUniquePos(x,y)];
    },

    fetchTiles: function(tiles, options){
        options = options || {};

        options.data = options.data || {};
        options.data.tiles =  JSON.stringify(tiles);

        options.remove = false;
        this.fetch(options);
    }

});
