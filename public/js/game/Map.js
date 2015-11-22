/**
 * Map is centered on the player and rebuilds itself
 * when player moves. I will add and remove tiles to
 * always keep the player in the middle of the map.
 *
 * @param options
 * @constructor
 */
ZT.Map = function(options){
    var that = this;

    _.extend(this, Backbone.Events);

    this.options = _.extend({
        game: undefined, //game reference
        totalTiles: 21,//total number of tiles (per axis)
        tileSize: 48, //tile size in pixels
        slotSize: 16, //slot size in pixels
        centerX: 0,//center tile position x
        centerY: 0,//center tile position y
        centerTile: undefined//tile that is in the center of the map
    },options || {});

    this.game = this.options.game;
    this.totalTiles = this.options.totalTiles;
    this.tileSize = this.options.tileSize;
    this.slotSize = this.options.slotSize;
    this.centerX = this.options.centerX;
    this.centerY = this.options.centerY;
    this.centerTile = this.options.centerTile; //center tile

    this.tileSlots = this.tileSize/this.slotSize;

    this.viewRegionsX = Math.floor(this.totalTiles/this.tileSize/this.game.regionTiles);
    this.viewRegionsY = Math.floor(this.totalTiles/this.tileSize/this.game.regionTiles);

    this.minX = -Math.floor(this.totalTiles/2);
    this.maxX = Math.floor(this.totalTiles/2);
    this.minY = -Math.floor(this.totalTiles/2);
    this.maxY = Math.floor(this.totalTiles/2);

    this.rangeX = Math.floor(this.totalTiles/2);
    this.rangeY = Math.floor(this.totalTiles/2);

    /**
     * all tiles currently visible in the map
     * tiles are indexed with format "x:y"
     * @type {{}}
     */
    this.tiles = {};

    this.regionsModels = new RegionCollection();

    this.regionsModels.on('sync',function(){
        //update visible tiles and cached tiles
        //first time must be sync (because of the loaded event bellow)
        this.updateVisibleRegions(_.size(this.lastVisibleRegions)===0);
    },this);

    this.regionsModels.once('sync',function(){
        //after the first sync, trigger the loaded event
        this.trigger('loaded');
    },this);

    this.centerTo(this.centerX,this.centerY);

};

ZT.Map.prototype.getTileByTileXY = function(tileX, tileY){

    return this.tiles[tileX + ":" + tileY];

};

ZT.Map.prototype.getTileByWorldXY = function(worldX, worldY){

    var tileX = Math.floor(worldX/this.tileSize);
    var tileY = Math.floor(worldY/this.tileSize);

    return this.tiles[tileX + ":" + tileY];

};

ZT.Map.prototype.getTileSlotByWorldXY = function(worldX, worldY){

    var tileX = Math.floor(worldX/this.tileSize);
    var tileY = Math.floor(worldY/this.tileSize);

    var slotX = Math.floor((worldX-tileX*this.tileSize) / this.slotSize);
    var slotY = Math.floor((worldY-tileY*this.tileSize) / this.slotSize);

    return (slotX+this.tileSlots*slotY);
};

ZT.Map.prototype.addTile = function(tileModel){

    var x = tileModel.get('pos')[0];
    var y = tileModel.get('pos')[1];

    var tile = new ZT.Tile({
        game: this.game,
        model: tileModel,
        x: x,
        y: y,
        mapX: x * this.tileSize,
        mapY: y * this.tileSize,
        size: this.tileSize,
        slotSize: this.slotSize
    });

    tile.draw();

    this.tiles[x + ":" + y] = tile;

    return tile;

};

/**
 * Cached regions layout (5x5 without edges):
 *    _ _ _
 *  _|C|C|C|_
 * |C|V|V|V|C|
 * |C|V|X|V|C|
 * |C|V|V|V|C|
 *   |C|C|C|
 *    ¯ ¯ ¯
 * X = player region
 * V = region visible to the player
 * C = cached region (used for smooth transitions and updates)
 * @param toX
 * @param toY
 */
ZT.Map.prototype.centerTo = function(toX,toY){

    this.centerRegionX = Math.floor(toX/this.options.regionTiles);
    this.centerRegionY = Math.floor(toY/this.options.regionTiles);

    this.firstRegionX = this.centerRegionX-2;
    this.lastRegionX = this.centerRegionX+2;
    this.firstRegionY = this.centerRegionY-2;
    this.lastRegionY = this.centerRegionY+2;

    //list of visible regions (X and V above)
    this.lastVisibleRegions = this.visibleRegions || {};
    this.visibleRegions = {};

    //list of cached regions (C above)
    this.lastCachedRegions = this.cachedRegions || {};
    this.cachedRegions = {};

    var regions = [];

    for(var x = this.firstRegionX; x <= this.lastRegionX; x++){
        for(var y = this.firstRegionY; y <= this.lastRegionY; y++){
            //don't fetch the edges
            if(x===this.firstRegionX && y===this.firstRegionY
                || x===this.firstRegionX && y===this.lastRegionY
                || x===this.lastRegionX && y===this.firstRegionY
                || x===this.lastRegionX && y===this.lastRegionY){
                continue;
            }

            if(Math.abs(x-this.centerRegionX)<=1 && Math.abs(y-this.centerRegionY)<=1){
                this.visibleRegions[RegionModel.generateId(x,y)] = true;
            }else{
                this.cachedRegions[RegionModel.generateId(x,y)] = true;
            }

            //check if already fetched region
            if(this.regionsModels.regionMap[RegionModel.generateId(x,y)]){
                continue;
            }

            regions.push([x,y]);
        }
    }

    //if have regions to download..
    if(regions.length){
        this.regionsModels.fetch({data: {points: JSON.stringify(regions)}, remove: false});
        //otherwise just update de view tiles not shown
    }else{
        //this.updateViewTiles();
    }


};

/**
 * Show the new tiles that are now visible and destroy the tiles
 * that are not visible. Also removes unnused cached regions
 * @param sync if the code should run sync or async
 */
ZT.Map.prototype.updateVisibleRegions = function(sync){

    var that = this;

    var toRemove = [];

    var tasks = [];

    var method = sync? async.parallel:async.series;

    this.regionsModels.each(function(regionModel){
        tasks.push(function(cb){
            if(that.visibleRegions[regionModel.getId()] && !that.lastVisibleRegions[regionModel.getId()]){
                regionModel.tiles.each(function(tileModel){
                    that.addTile(tileModel);
                });
            }else if(that.lastVisibleRegions[regionModel.getId()] && !that.visibleRegions[regionModel.getId()]){
                regionModel.tiles.each(function(tileModel){
                    that.getTileByTileXY(tileModel.x,tileModel.y).destroy();
                });
            }

            if(that.lastCachedRegions[regionModel.getId()] && !that.cachedRegions[regionModel.getId()] && !that.visibleRegions[regionModel.getId()]){
                toRemove.push(regionModel);
            }

            setTimeout(cb,sync?0:50);

        });
    });

    method(tasks,function(){
        that.regionsModels.remove(toRemove);
    });

};

ZT.Map.prototype.moveRelative = function(relX, relY){

    if(!relX && !relY) return;

    this.centerX = this.centerX+relX;
    this.centerY = this.centerY+relY;

    return this.centerTo(this.centerX,this.centerY);

};

ZT.Map.prototype.destroy = function(){

};