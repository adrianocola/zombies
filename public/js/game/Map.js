ZT.Map = function(options){

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

    this.firstX = -Math.floor(this.width/2);
    this.lastX = Math.floor(this.width/2);
    this.firstY = -Math.floor(this.width/2);
    this.lastY = Math.floor(this.width/2);

    this.tiles = {};

    for(var x = this.firstX; x<=this.lastX; x++){
        for(var y = this.firstY; y<=this.lastY; y++){
            var tile = this.addTile(x,y);
            tile.realX = this.realCenterX+x;
            tile.realY = this.realCenterY+y;
        }
    }

}

ZT.Map.prototype.getTile = function(x, y){
    return this.tiles[x + ':' + y];
}

ZT.Map.prototype.getTileWorldXY = function(worldX, worldY){

    var tileX = Math.floor((worldX - this.game.phaser.world.bounds.x)/this.tileWidth) + this.firstX;
    var tileY = Math.floor((worldY - this.game.phaser.world.bounds.y)/this.tileHeight) + this.firstY;

    return this.tiles[tileX + ":" + tileY];

}

ZT.Map.prototype.addTile = function(x,y){
    var tile = new ZT.Tile({
        game: this.game,
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
            if(tile) tile.destroy();
        }
    }

    for(var y = 0; y < absY; y++){
        for(var x = this.firstX; x <= this.lastX; x++){
            //if is moving down, should remove from the top side
            var mapY = isBottom?this.firstY+y:this.lastY-y;

            var tile = this.tiles[x + ":" + mapY];
            delete this.tiles[x + ":" + mapY];
            if(tile) tile.destroy();
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

    var centerTile = this.tiles[0 + ":" + 0];
    this.centerWorldX = centerTile.worldX;
    this.centerWorldY = centerTile.worldY;
    this.realCenterX = centerTile.realX;
    this.realCenterY = centerTile.realY;

    for(var x = 0; x < absX; x++){
        for(var y = this.firstY; y <= this.lastY; y++){
            var mapX = isRight?this.lastX-x:this.firstX+x;
            this.addTile(mapX,y);
        }
    }

    for(var y = 0; y < absY; y++){
        for(var x = this.firstX; x <= this.lastX; x++){
            var mapY = isBottom?this.lastY-y:this.firstY+y;
            var tile = this.addTile(x,mapY);
        }
    }

}

ZT.Map.prototype.destroy = function(){

}