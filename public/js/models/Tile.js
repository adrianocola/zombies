
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

    /**
     * Fetch multiple points
     * WARNING: Poor performance! Fetch with rects instead!
     * @param points arrays of points [ [x,y], [x,y], ... ]
     * @param options
     */
    fetchInPoints: function(points, options){
        options = options || {};

        options.data = options.data || {};
        options.data.points =  JSON.stringify(points);

        options.remove = false;
        this.fetch(options);
    },

    /**
     * Fetch one rect
     * @param rect rect array [ [x1,y2] , [x2,y2] ]
     * @param options
     */
    fetchInRect: function(rect, options){
        options = options || {};

        options.data = options.data || {};
        options.data.rect =  JSON.stringify(rect);

        options.remove = false;
        this.fetch(options);
    },

    /**
     * Fetch two rects
     * @param rect1 first rect array [ [x1,y2] , [x2,y2] ]
     * @param rect2 second rect array [ [x1,y2] , [x2,y2] ]
     * @param options
     */
    fetchInTwoRects: function(rect1, rect2, options){
        options = options || {};

        options.data = options.data || {};
        options.data.rect1 =  JSON.stringify(rect1);
        options.data.rect2 =  JSON.stringify(rect2);

        options.remove = false;
        this.fetch(options);
    },

    /**
     * Fetch a single point
     * @param point point array [x,y]
     * @param options
     */
    fetchInPoint: function(point, options){
        options = options || {};

        options.data = options.data || {};
        options.data.point =  JSON.stringify(point);

        options.remove = false;
        this.fetch(options);
    }

});
