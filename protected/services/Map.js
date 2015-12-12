

var Map = {
    regionIdByTile: function(tileX,tileY){
        return Math.floor(tileX/app.consts.regionSize) + ':' + Math.floor(tileY/app.consts.regionSize);

    },
    regionPosByTile: function(tileX,tileY){
        return [Math.floor(tileX/app.consts.regionSize),Math.floor(tileY/app.consts.regionSize)];
    },
    /**
     * Get tile index in region's tiles arrayo
     * @param tileX
     * @param tileY
     * @returns {number}
     */
    tileArrayIndex: function(tileX, tileY){
        return (tileX%app.consts.regionSize)*app.consts.regionSize + (tileY%app.consts.regionSize);
    },
    regionsAroundRegion: function(regionX,regionY){

        var firstRegionX = regionX-2;
        var lastRegionX = regionX+2;
        var firstRegionY = regionY-2;
        var lastRegionY = regionY+2;
        var regions = [];

        for(var x = firstRegionX; x <= lastRegionX; x++){
            for(var y = firstRegionY; y <= lastRegionY; y++){
                //don't consider the edges
                if(x===firstRegionX && y===firstRegionY
                    || x===firstRegionX && y===lastRegionY
                    || x===lastRegionX && y===firstRegionY
                    || x===lastRegionX && y===lastRegionY){
                    continue;
                }

                regions.push([x,y]);
            }
        }

        return regions;

    }
};

module.exports = Map;