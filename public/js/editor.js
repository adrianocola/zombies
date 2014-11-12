




$(function(){

    var $map = $('.map');
    var $viewport = $('.viewport');
    var width = $map.width();
    var height = $map.height();
    var tileWidth = 48;
    var tileHeight = 48;

    var viewTilesX = Math.floor(width/tileWidth);
    var viewTilesY = Math.floor(height/tileHeight);

    var firstTileX = 0;
    var lastTileX = Math.floor(width/tileWidth);
    var firstTileY = 0;
    var lastTileY = Math.floor(height/tileHeight);


    function addTile(x,y){
        var $tile = $('<div class="tile"></div>');
        $tile.css({
            left: x*tileWidth,
            top:  y*tileHeight,
            width: tileWidth,
            height: tileHeight
        });
        $tile.html('<div class="tile_position">' + x + ',' + y + '</div>');

        return $tile;
    }

    for(var x = firstTileX; x<lastTileX; x++){
        for(var y = firstTileY; y<lastTileY; y++){
            $viewport.append(addTile(x,y));
        }
    }

    var startX = 0, startY = 0;

    $viewport.pep({
        //constrainTo: 'parent',
        grid: [tileWidth,tileHeight],
        shouldEase: false,
        start: function(){
            startX = this.cssX || 0;
            startY = this.cssY || 0;
        },
        stop: function(){

            var tileTopLeftX = -this.cssX / tileWidth;
            var tileTopLeftY = -this.cssY / tileHeight;

            var inX, inY;

            if(tileTopLeftX >= firstTileX
                && tileTopLeftX + viewTilesX -1 < lastTileX){
                inX = true;

            }

            if(tileTopLeftY >= firstTileY
                && tileTopLeftY + viewTilesY -1 < lastTileY ){
                inY = true;
            }

            if(inX && inY){
                return;
            }

            var moveX = (startX - this.cssX) / tileWidth;
            var moveY = (startY - this.cssY) / tileHeight;

            var isRight = moveX>0;
            var isBottom = moveY>0;

            var absX = Math.abs(moveX);
            var absY = Math.abs(moveY);

            console.log("MOVE: " + (inX?0:moveX) + "," + (inY?0:moveY));

            if(!inX){
                for(var x = 0; x < absX; x++){
                    var toX = isRight?x + lastTileX:firstTileX - x -1;
                    for(var y = firstTileY; y < lastTileY; y++){
                        $viewport.append(addTile(toX,y));
                    }
                }

                if(isRight) lastTileX = lastTileX + absX;
                else firstTileX = firstTileX - absX;
            }


            if(!inY){
                for(var y = 0; y < absY; y++){
                    var toY = isBottom?y + lastTileY:firstTileY - y -1;
                    for(var x = firstTileX; x < lastTileX; x++){
                        $viewport.append(addTile(x,toY));
                    }
                }

                if(isBottom) lastTileY = lastTileY + absY;
                else firstTileY = firstTileY - absY;
            }





        }
    });




});