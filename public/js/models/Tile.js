
var TileModel = Backbone.Model.extend({

    idAttribute: 'pos',

    url: function(){
        return '/api/editor/tiles/' + this.getId();
    },

    initialize: function(attributes){
        this.things = new ThingsCollection();
        _.each(this.get('things'),function(value,key){
            value.slot = key;
            this.things.add(value);
        },this);

        this.x = this.get("pos")[0];
        this.y = this.get("pos")[1];

    },

    getId: function(){
        return TileModel.generateId(this.get("pos")[0],this.get("pos")[1]);
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
