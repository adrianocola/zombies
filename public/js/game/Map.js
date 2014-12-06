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
    this.centerX = this.options.centerX; //center tile position x
    this.centerY = this.options.centerY; //center tile position y
    this.centerTile = this.options.centerTile; //center tile

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

    this.tilesModels = new TilesCollection();

    var fetchRect = [
        [ this.centerX - this.rangeX, this.centerY - this.rangeY],
        [ this.centerX + this.rangeX, this.centerY + this.rangeY]
    ]

    this.tilesModels.fetchInRect(fetchRect,{success: function(){
        that.centerTile = that.tiles[that.centerX + ":" + that.centerY];
    }});

    this.tilesModels.on('add',function(tileModel){
        that.addTile(tileModel);
    });

}

ZT.Map.prototype.getTileWorldXY = function(worldX, worldY){

    var tileX = Math.floor(worldX/this.tileWidth);
    var tileY = Math.floor(worldY/this.tileHeight);

    return this.tiles[tileX + ":" + tileY];

}

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

}

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

    this.centerTile = this.tiles[(this.centerX+relX) + ":" + (this.centerY+relY)];
    this.centerX = this.centerTile.x;
    this.centerY = this.centerTile.y;

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

}

ZT.Map.prototype.destroy = function(){

}