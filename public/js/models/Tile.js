
var TileModel = Backbone.Model.extend({

    idAttribute: 'pos',

    url: function(){
        return '/api/editor/tiles/' + this.getId();
    },

    initialize: function(attributes){
        this.slots = new SlotsCollection();
        _.each(this.get('slots'),function(value,key){
            value.slot = key;
            this.slots.add(value);
        },this);

    },

    getId: function(){
        return TileModel.generateId(this.get("x"),this.get("y"));
    }

});

TileModel.generateId = function(x,y){
    return x + ':' + y;
};

var TilesCollection = Backbone.Collection.extend({
    model: TileModel,

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
