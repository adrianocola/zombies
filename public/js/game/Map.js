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

    this.options = options || {};

    this.game = this.options.game;
    this.width = this.options.width;
    this.height = this.options.height;
    this.tileWidth = this.options.tileWidth;
    this.tileHeight = this.options.tileHeight;
    this.slotWidth = this.options.slotWidth;
    this.slotHeight = this.options.slotHeight;
    this.centerX = this.options.centerX || 0; //center tile position x
    this.centerY = this.options.centerY || 0; //center tile position y
    this.centerTile = this.options.centerTile; //center tile

    this.viewRegionsX = Math.floor(this.width/this.tileWidth/this.regionSize);
    this.viewRegionsY = Math.floor(this.height/this.tileHeight/this.regionSize);

    this.minX = -Math.floor(this.width/2);
    this.maxX = Math.floor(this.width/2);
    this.minY = -Math.floor(this.height/2);
    this.maxY = Math.floor(this.height/2);

    this.rangeX = Math.floor(this.width/2);
    this.rangeY = Math.floor(this.height/2);

    /**
     * all tiles currently visible in the map
     * tiles are indexed with format "x:y"
     * @type {{}}
     */
    this.tiles = {};

    this.regionsModels = new RegionCollection();

    this.regionsModels.on('add',function(regionModel){
        regionModel.tiles.each(function(tileModel){
            that.addTile(tileModel);
        });
    });

    this.centerTo(this.centerX,this.centerY);

};

ZT.Map.prototype.getTileWorldXY = function(worldX, worldY){

    var tileX = Math.floor(worldX/this.tileWidth);
    var tileY = Math.floor(worldY/this.tileHeight);

    return this.tiles[tileX + ":" + tileY];

};

ZT.Map.prototype.addTile = function(tileModel){

    var x = tileModel.get('pos')[0];
    var y = tileModel.get('pos')[1];

    var tile = new ZT.Tile({
        game: this.game,
        tileModel: tileModel,
        x: x,
        y: y,
        mapX: x * this.tileWidth,
        mapY: y * this.tileHeight,
        width: this.tileWidth,
        height: this.tileHeight
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

    this.centerRegionX = Math.floor(toX/this.options.regionSize);
    this.centerRegionY = Math.floor(toY/this.options.regionSize);

    this.firstRegionX = this.centerRegionX-2;
    this.lastRegionX = this.centerRegionX+2;
    this.firstRegionY = this.centerRegionY-2;
    this.lastRegionY = this.centerRegionY+2;

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

ZT.Map.prototype.moveRelative = function(relX, relY){

    if(!relX && !relY) return;

    this.centerX = this.centerX+relX;
    this.centerY = this.centerY+relY;

    return this.centerTo(this.centerX,this.centerY);

    var absX = Math.abs(relX);
    var absY = Math.abs(relY);

    var isRight = relX>0;
    var isBottom = relY>0;

    for(var x = 0; x < absX; x++){
        for(var y = this.minY + this.centerY ; y <= this.maxY + this.centerY ; y++){
            //if is moving right, should remove from the left side
            var mapX = this.centerX + (isRight?this.minX+x:this.maxX-x);

            var tile = this.tiles[mapX + ":" + y];
            delete this.tiles[mapX + ":" + y];
            if(tile){
                tile.destroy();
                this.tilesModels.remove(tile.tileModel);
            }
        }
    }

    for(var y = 0; y < absY; y++){
        for(var x = this.centerX - this.rangeX ; x <= this.maxX + this.centerX ; x++){
            //if is moving down, should remove from the top side
            var mapY = this.centerY + (isBottom?this.minY+y:this.maxY-y);

            var tile = this.tiles[x + ":" + mapY];
            delete this.tiles[x + ":" + mapY];
            if(tile){
                tile.destroy();
                this.tilesModels.remove(tile.tileModel);
            }
        }
    }

    var centerTile = this.tiles[(this.centerX+relX) + ":" + (this.centerY+relY)];
    this.centerX = centerTile.x;
    this.centerY = centerTile.y;

    if(relX){
        var x = isRight?this.maxX:this.minX;
        var topLeft1 = [this.centerX  + x - relX +1, this.minY-relY + this.centerY];
        var bottomRight1 = [this.centerX + x, this.maxY-relY + this.centerY];
    }
    if(relY){
        var y = isBottom?this.maxY:this.minY;
        var topLeft2 = [this.minX-relX + this.centerX, this.centerY + y - relY + 1];
        var bottomRight2 = [this.maxX-relX + this.centerX, this.centerY + y];
    }

    if(relX && relY){
        //in case of a diagonal move adjust the rects
        topLeft1[1] += relY;
        bottomRight1[1] += relY;
        topLeft2[0] += relX;
        bottomRight2[0] += relX;

        this.tilesModels.fetchInTwoRects([ topLeft1, bottomRight1 ], [ topLeft2 ,bottomRight2 ]);
    }else if(relX){
        this.tilesModels.fetchInRect([ topLeft1, bottomRight1 ]);
    }else if(relY) {
        this.tilesModels.fetchInRect([topLeft2, bottomRight2]);
    }

};

ZT.Map.prototype.destroy = function(){

};