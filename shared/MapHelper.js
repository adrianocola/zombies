var consts = require('./consts');

module.exports = {
    regionIdByTileXY: function (tileX, tileY) {
        return Math.floor(tileX / consts.regionTiles) + ':' + Math.floor(tileY / consts.regionTiles);
    },
    regionXYByTileXY: function (tileX, tileY) {
        return {x: Math.floor(tileX / consts.regionTiles), y: Math.floor(tileY / consts.regionTiles)};
    },
    /**
     * Get tile index in region's tiles array
     * @param tileX
     * @param tileY
     * @returns {number}
     */
    tileArrayIndex: function (tileX, tileY) {
        return (tileX % consts.regionTiles) + (tileY % consts.regionTiles) * consts.regionTiles;
    },
    tileXYByTileId: function (tileId) {
        var splitId = id.split(':');
        return {x: parseInt(splitId[0]), y: parseInt(splitId[1])};
    },
    regionsAroundRegion: function (regionX, regionY) {

        var firstRegionX = regionX - 2;
        var lastRegionX = regionX + 2;
        var firstRegionY = regionY - 2;
        var lastRegionY = regionY + 2;
        var regions = [];

        for (var x = firstRegionX; x <= lastRegionX; x++) {
            for (var y = firstRegionY; y <= lastRegionY; y++) {
                //don't consider the edges
                if (x === firstRegionX && y === firstRegionY
                    || x === firstRegionX && y === lastRegionY
                    || x === lastRegionX && y === firstRegionY
                    || x === lastRegionX && y === lastRegionY) {
                    continue;
                }

                regions.push({x: x, y: y});
            }
        }

        return regions;

    }

};
