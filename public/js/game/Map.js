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
     * all tiles managed by the map
     * tiles are indexed with format "x:y"
     * @type {{}}
     */
    this.tiles = {};
    /**
     * all tiles currently visible in the map
     * tiles are indexed with format "x:y"
     * @type {{}}
     */
    this.visibleTiles = {};

    this.regionsModels = new RegionCollection();

    this.regionsModels.on('sync',function(){
        console.log("SYNC");
        //update visible tiles and cached tiles
        this.updateCachedTiles();
    },this);

    this.regionsModels.once('sync',function(){
        //after the first sync, trigger the loaded event
        this.updateVisibleTiles();
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

    this.tiles[x + ":" + y] = tile;

    return tile;

};

/**
 * Cached regions layout (5x5 without edges):
 *    _ _ _
 *  _|C|C|C|_
 * |C|C|C|C|C|
 * |C|C|X|C|C|
 * |C|C|C|C|C|
 *   |C|C|C|
 *    ¯ ¯ ¯
 * X = player region
 * C = cached region (used for smooth transitions and updates)
 * @param toX tile X to center
 * @param toY tile Y to center
 */
ZT.Map.prototype.centerTo = function(toX,toY){

    this.centerRegionX = Math.floor(toX/this.options.regionTiles);
    this.centerRegionY = Math.floor(toY/this.options.regionTiles);

    this.firstRegionX = this.centerRegionX-2;
    this.lastRegionX = this.centerRegionX+2;
    this.firstRegionY = this.centerRegionY-2;
    this.lastRegionY = this.centerRegionY+2;

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

            this.cachedRegions[RegionModel.generateId(x,y)] = true;

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
    }


};

/**
 * Manage cache tiles
 */
ZT.Map.prototype.updateCachedTiles = function(sync){

    var toRemove = [];

    this.regionsModels.each(function(regionModel){

        if(this.cachedRegions[regionModel.getId()] && !this.lastCachedRegions[regionModel.getId()]){
            regionModel.tiles.each(function(tileModel){
                this.addTile(tileModel);
            },this);
        }else if(this.lastCachedRegions[regionModel.getId()] && !this.cachedRegions[regionModel.getId()]){
            toRemove.push(regionModel);
            regionModel.tiles.each(function(tileModel){
                this.getTileByTileXY(tileModel.x,tileModel.y).destroy();
            },this);
        }

    },this);

    this.regionsModels.remove(toRemove);

};

/**
 * Update the visible tiles to only show the tiles that
 * are in player view range
 */
ZT.Map.prototype.updateVisibleTiles = function(sync){

    for(var x = this.minX; x <= this.maxX; x++){
        for(var y = this.minY; y <= this.maxY; y++){

            var rX = this.centerX + x;
            var rY = this.centerY + y;

            var tile = this.tiles[rX + ":" + rY];

            if(tile && !this.visibleTiles[rX + ":" + rY]){
                tile.draw();
                this.visibleTiles[rX + ":" + rY] = tile;
            }

        }
    }

};



ZT.Map.prototype.moveRelative = function(relX, relY){

    if(!relX && !relY) return;

    var absX = Math.abs(relX);
    var absY = Math.abs(relY);

    var isRight = relX>0;
    var isBottom = relY>0;

    for(var x = 0; x < absX; x++){
        for(var y = this.minY + this.centerY ; y <= this.maxY + this.centerY ; y++){
            //if is moving right, should remove from the left side
            var mapX = this.centerX + (isRight?this.minX+x:this.maxX-x);

            var tile = this.visibleTiles[mapX + ":" + y];
            delete this.visibleTiles[mapX + ":" + y];
            if(tile){
                tile.destroy();
            }
        }
    }

    for(var y = 0; y < absY; y++){
        for(var x = this.centerX - this.rangeX ; x <= this.maxX + this.centerX ; x++){
            //if is moving down, should remove from the top side
            var mapY = this.centerY + (isBottom?this.minY+y:this.maxY-y);

            var tile = this.visibleTiles[x + ":" + mapY];
            delete this.visibleTiles[x + ":" + mapY];
            if(tile){
                tile.destroy();
            }
        }
    }

    this.centerX = this.centerX+relX;
    this.centerY = this.centerY+relY;

    this.updateVisibleTiles();

    return this.centerTo(this.centerX,this.centerY);


};

ZT.Map.prototype.destroy = function(){

};