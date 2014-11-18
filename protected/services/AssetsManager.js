var jf = require('jsonfile');
var fs = require('fs-extra');

var ASSETS_PATH = 'assets';

var AssetsManager = {
    getTileTypesList: function(cb){
        if(!cb) return;

        jf.readFile(ASSETS_PATH + '/tiles.json',function(err,tiles){
            cb(err,tiles && _.values(tiles.tiles));
        });

    },
    updateTileType: function(file,data,cb){

        jf.readFile(ASSETS_PATH + '/tiles.json',function(err,tiles){
            if(err) console.log(err);

            //tile already exists
            if(data._id){
                var oldTile = tiles.tiles[data._id];
                var tile = _.extend({},oldTile,data);

                if(file){
                    fs.unlink(ASSETS_PATH + '/tiles/' + oldTile.name + '.png');
                }else if(oldTile.name != tile.name){
                    var oldFile = ASSETS_PATH + '/tiles/' + oldTile.name + '.png';
                    var newFile = ASSETS_PATH + '/tiles/' + tile.name + '.png';
                }

            }else{
                if(!file) return cb("Missing file!");

                var tile = data || {};
                tile._id = _.size(tiles.tiles)+1;
            }

            if(file){
                var oldFile = file.path;
                var newFile = ASSETS_PATH + '/tiles/' + tile.name + '.png';
            }

            tiles.tiles[tile._id] = tile;

            jf.writeFile(ASSETS_PATH + '/tiles.json', tiles, function(err) {

                if(err) console.log(err);

                if(newFile){
                    fs.move(oldFile, newFile, {clobber: true}, function(err) {
                        if(err) console.log(err);

                        cb(null,tile);
                    });
                }else{
                    cb(null,tile);
                }

            });

        });

    }
}

module.exports = AssetsManager;