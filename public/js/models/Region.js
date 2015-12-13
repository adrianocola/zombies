
var RegionModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){
        this.tiles = new TilesCollection();
        this.tiles.add(this.get('tiles'));
    },

    getId: function(){
        return RegionModel.generateId(this.get("x"),this.get("y"));
    }

});

RegionModel.generateId = function(x,y){
    return x + ':' + y;
};

var RegionCollection = Backbone.Collection.extend({
    model: RegionModel,

    url: '/api/editor/regions/',
    regionMap: {},

    initialize: function(){

        this.on('add',this.onAdd);
        this.on('remove',this.onRemove);

    },

    onAdd: function(region){
        socket.emit(ZT.shared.events.ENTER_REGION,region.getId());
        this.regionMap[region.getId()] = region;
    },

    onRemove: function(region){
        socket.emit(ZT.shared.events.LEAVE_REGION,region.getId());
        delete this.regionMap[region.getId()];
    },

    getByPos: function(x,y){
        return this.regionMap[RegionModel.generateId(x,y)];
    },

    getByTilePos: function(tileX,tileY){
        var x = Math.floor(tileX/11);
        var y = Math.floor(tileY/11);
        return this.getByPos(x,y);
    }

});
