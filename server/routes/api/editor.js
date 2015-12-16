var async = require('async');
var sizeof = require('object-sizeof');

server.get('/api/editor/resetWorld', function (req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/html'
        , 'Transfer-Encoding': 'chunked'
    });

    var toX = parseInt(req.query.x || 10);
    var toY = parseInt(req.query.y || 10);
    var size = parseInt(req.query.size || server.consts.regionTiles);

    var total = (toX + 1) * (toY + 1);

    res.write("Creating " + total + " regions ( " + (total*(11*11)) + "tiles)<br>");

    server.models.World.findOne({name: "zombietown"}, function(err, world) {

        if(!world){
            world = new server.models.World({name: "zombietown"});
        }

        world.top = 0;
        world.right = toX;
        world.bottom = toY;
        world.left = 0;

        world.save();

    });

    res.write("Reseting DB...<br>");

    server.models.Region.remove({},function(err) {

        if(err) console.log(err);

        var start = new Date();

        var count = 0;
        var nextPerc = 1;

        res.write("Adding Regions...<br>");

        var ping = setInterval(function(){
            res.write('<span></span>');
        },30000);

        var region;

        var x = 0;
        var y = 0;

        async.whilst(function(){
            return x <= toX && y <= toY;
        },function(done){

            region = new server.models.Region({
                x: x,
                y: y
            });

            for(var i=0;i<size;i++){
                for(var j=0;j<size;j++) {
                    var tile = new server.models.Tile({type: 1, x: (x*size)+j, y:(y*size)+i,slots:[]});
                    var tc = _.sample([0,0,0,1,1,1,2,2,3,4]);
                    while(tc>0){

                        tile.slots[_.random(0,8)] = new server.models.Slot({
                            floor: [],
                            stand: new server.models.Thing({
                                "name" : "zombie",
                                "type" : 2
                            })
                        });

                        tc--;
                    }
                    for(var k=0;k<9;k++){
                        if(!tile.slots[k]){
                            tile.slots[k] = new server.models.Slot({
                                floor: [],
                                stand: undefined
                            })
                        }
                    }

                    region.tiles.push(tile);
                }
            }

            region.save(done);

            count++;

            if(Math.floor(100*count/total) === nextPerc){
                if(nextPerc%10 === 0){
                    console.log(nextPerc + "%");
                    res.write(nextPerc + "%");
                }else{
                    res.write(".");
                }

                nextPerc++;
            }

            y++;

            if(y>toY){
                x++;
                y=0;
            }

        },function(err){
            if(err) console.log(err);

            clearInterval(ping);
            res.write("<br><br>Finished in : " + (new Date() - start) + "ms");
            res.end();
        });

    });

});

server.get('/api/editor/regions', function (req, res) {



    if(!req.query.points || !req.query.points.length) return res.json([]);

    var points = req.query.points;

    if(typeof req.query.points === "string") points = JSON.parse(points);

    var query = {$or: []};
    for(var i=0;i<points.length;i++){
        var p = points[i];
        query.$or.push({x: parseInt(p.x),y: parseInt(p.y)});
    }

    var start = new Date();

    server.models.Region.collection.find(query).toArray(function(err, regions){
        if(err) console.log(err);
        console.log("Fetched " + regions.length + " documents in " + (new Date() - start) + "ms (" +  (Math.round(sizeof(regions)/1024)) + "KB)");

        res.json(regions);
    });

});

server.put('/api/editor/tiles/:id', function (req, res) {

    var tile = req.body;

    //prevent position update
    delete tile.x;
    delete tile.y;

    if(typeof req.params.id !== 'string') return json(500,false);

    var tileXY = shared.mapHelper.tileXYByTileId(req.params.id);
    var tileIndex = shared.mapHelper.tileArrayIndex(tileXY.x,tileXY.y);

    var $set = {};
    for (var key in tile) {
        $set['tiles.'+tileIndex+'.'+key] = tile[key];
    }

    server.models.Region.update({
        pos: shared.regionIdByTileXY(tileXY.x,tileXY.y)
    },{ "$set": $set},function(err,updated){

        if(err) console.log(err);

        res.json(true);

    });


});

server.get('/api/editor/tiletypes', function (req, res) {

    server.services.AssetsManager.getTileTypesList(function(err, tiles){
        res.json(tiles);
    });

});

server.put('/api/editor/tiletypes/:id', function (req, res) {

    server.services.AssetsManager.updateTileType(null,req.body,function(err, tileType){
        res.json(tileType);
    });

});

server.get('/api/editor/thingtypes', function (req, res) {

    server.services.AssetsManager.getThingTypesList(function(err, tiles){
        res.json(tiles);
    });

});


server.post('/api/editor/upload', function(req, res, next){

    var file = req.files.tileupload;

    if(!file){
        res.status(500).send("Error when uploading file!");
    }

    //o limite máximo é 100k para qualquer imagem
    if(file.size > 102400){
        return res.status(500).send("Image size must be lower than 5Mb!");
    }else if(file.mimetype != "image/png"){
        return res.status(500).send("Only .png files allowed!");
    }

    delete req.query.tileupload;
    server.services.AssetsManager.updateTileType(file,req.query,function(err, tileType){

        res.json(tileType);

    });



});