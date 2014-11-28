/**
 * Map is centered on the player and rebuilds itself
 * when player moves. I will add and remove tiles to
 * always keep the player in the middle of the map.
 *
 * There is a correlation with the real map center, but
 * the map tries to work relative to player position
 * (as if the player was always at position 0,0 )
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
    this.centerWorldX = this.options.centerWorldX; // in px
    this.centerWorldY = this.options.centerWorldY; // in px
    this.realCenterX = this.options.realCenterX;
    this.realCenterY = this.options.realCenterY;
    this.centerTile = this.options.centerTile;

    this.firstX = -Math.floor(this.width/2);
    this.lastX = Math.floor(this.width/2);
    this.firstY = -Math.floor(this.width/2);
    this.lastY = Math.floor(this.width/2);

    this.tiles = {};

    this.tilesModels = new TilesCollection();

    var fetchRect = [
        [ this.firstX + this.realCenterX, this.firstY + this.realCenterY ],
        [ this.lastX + this.realCenterX , this.lastY + this.realCenterY]
    ]

    this.tilesModels.fetchInRect(fetchRect,{success: function(){
        that.centerTile = that.tiles[0 + ":" + 0];
    }});

    this.tilesModels.on('add',function(tileModel){
        that.addTile(tileModel);
    });

}

ZT.Map.prototype.getTile = function(x, y){
    return this.tiles[x + ':' + y];
}

ZT.Map.prototype.getTileWorldXY = function(worldX, worldY){

    var tileX = Math.floor((worldX - this.game.phaser.world.bounds.x)/this.tileWidth) + this.firstX;
    var tileY = Math.floor((worldY - this.game.phaser.world.bounds.y)/this.tileHeight) + this.firstY;
    return this.tiles[tileX + ":" + tileY];

}

ZT.Map.prototype.addTile = function(tileModel){

    var x,y;
    if(this.centerTile){
        x = tileModel.get('pos')[0] - this.centerTile.tileModel.get('pos')[0];
        y = tileModel.get('pos')[1] - this.centerTile.tileModel.get('pos')[1];
    }else{
        x = tileModel.get('pos')[0];
        y = tileModel.get('pos')[1];
    }

    var tile = new ZT.Tile({
        game: this.game,
        tileModel: tileModel,
        x: x,
        y: y,
        worldX: x * this.tileWidth + this.centerWorldX,
        worldY: y * this.tileHeight + this.centerWorldY,
        realX: x + this.realCenterX,
        realY: y + this.realCenterY,
        width: this.tileWidth,
        height: this.tileHeight
    });

    tile.draw();

    this.tiles[x + ":" + y] = tile;

    return tile;

}

ZT.Map.prototype.move = function(moveX, moveY){

    if(!moveX && !moveY) return;

    var absX = Math.abs(moveX);
    var absY = Math.abs(moveY);

    var isRight = moveX>0;
    var isBottom = moveY>0;

    for(var x = 0; x < absX; x++){
        for(var y = this.firstY; y <= this.lastY; y++){
            //if is moving right, should remove from the left side
            var mapX = isRight?this.firstX+x:this.lastX-x;

            var tile = this.tiles[mapX + ":" + y];
            delete this.tiles[mapX + ":" + y];
            if(tile){
                tile.destroy();
                this.tilesModels.remove(tile.tileModel);
            }
        }
    }

    for(var y = 0; y < absY; y++){
        for(var x = this.firstX; x <= this.lastX; x++){
            //if is moving down, should remove from the top side
            var mapY = isBottom?this.firstY+y:this.lastY-y;

            var tile = this.tiles[x + ":" + mapY];
            delete this.tiles[x + ":" + mapY];
            if(tile){
                tile.destroy();
                this.tilesModels.remove(tile.tileModel);
            }
        }
    }

    var new_tiles = {};

    for(var index in this.tiles) {
        var tile = this.tiles[index];
        if(tile){
            tile.updatePosition(moveX,moveY);
            new_tiles[tile.x + ":" + tile.y] = tile;
        }
    }

    this.tiles = new_tiles;

    this.centerTile = this.tiles[0 + ":" + 0];
    this.centerWorldX = this.centerTile.worldX;
    this.centerWorldY = this.centerTile.worldY;
    this.realCenterX = this.centerTile.realX;
    this.realCenterY = this.centerTile.realY;

    if(moveX){

        var x = isRight?this.lastX:this.firstX;
        var topLeft1 = [this.realCenterX  + x - moveX +1, this.firstY-moveY + this.realCenterY];
        var bottomRight1 = [this.realCenterX + x, this.lastY-moveY + this.realCenterY];
    }
    if(moveY){
        var y = isBottom?this.lastY:this.firstY;
        var topLeft2 = [this.firstX-moveX + this.realCenterX, this.realCenterY + y - moveY + 1];
        var bottomRight2 = [this.lastX-moveX + this.realCenterX, this.realCenterY + y];
    }

    if(moveX && moveY){
        //in case of a diagonal move adjust the rects
        topLeft1[1] += moveY;
        bottomRight1[1] += moveY;
        topLeft2[0] += moveX;
        bottomRight2[0] += moveX;

        this.tilesModels.fetchInTwoRects([ topLeft1, bottomRight1 ], [ topLeft2 ,bottomRight2 ]);
    }else if(moveX){
        this.tilesModels.fetchInRect([ topLeft1, bottomRight1 ]);
    }else if(moveY) {
        this.tilesModels.fetchInRect([topLeft2, bottomRight2]);
    }

}

ZT.Map.prototype.destroy = function(){

}