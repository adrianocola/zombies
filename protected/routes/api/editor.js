var async = require('async');
var sizeof = require('object-sizeof');

app.get('/api/editor/resetWorld', function (req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/html'
        , 'Transfer-Encoding': 'chunked'
    });

    var toX = parseInt(req.query.x || 10);
    var toY = parseInt(req.query.y || 10);
    var size = parseInt(req.query.size || app.consts.regionSize);

    var total = (toX + 1) * (toY + 1);

    res.write("Creating " + total + " regions ( " + (total*(11*11)) + "tiles)<br>");

    app.models.World.findOne({name: "zombietown"}, function(err, world) {

        if(!world){
            world = new app.models.World({name: "zombietown"});
        }

        world.top = 0;
        world.right = toX;
        world.bottom = toY;
        world.left = 0;

        world.save();

    });

    res.write("Reseting DB...<br>");

    app.models.Region.remove({},function(err) {

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

            region = new app.models.Region({
                pos: [x, y]
            });

            for(var i=0;i<size;i++){
                for(var j=0;j<size;j++) {
                    var tile = {type: 1, pos: [(x*size)+i,(y*size)+j],things: {}};
                    var tc = _.random(0,3);
                    while(tc>0){
                        tile.things[_.random(0,9)] = new app.models.Thing({
                            "name" : "zombie",
                            "type" : 2
                        });
                        tc--;
                    }
                    region.tiles.push(tile);
                }
            }

            region.save(done);

            count++;

            if(Math.floor(100*count/total) === nextPerc){
                if(nextPerc%10 === 0){
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

app.get('/api/editor/regions', function (req, res) {

    var start = new Date();

    var query = {pos: {$in: JSON.parse(req.query.points)}};

    //avoid empty search error
    if(query.$or && query.$or.length===0) return res.json([]);

    app.models.Region.collection.find(query).toArray(function(err,regions){
        if(err) console.log(err);
        console.log("Fetched " + regions.length + " documents in " + (new Date() - start) + "ms (" +  (Math.round(sizeof(regions)/1024)) + "KB)");

        res.json(regions);
    });

});

app.put('/api/editor/tiles/:id', function (req, res) {

    var tile = req.body;

    //prevent position update
    delete tile.pos;

    if(typeof req.params.id !== 'string') return json(500,false);

    var pos = app.models.Tile.getArrayIndexByTileId(req.params.id);

    //console.log('id: ' + id);
    //console.log('region: ' + region);
    //console.log('pos: ' + pos);

    var $set = {};
    for (var key in tile) {
        $set['tiles.'+pos+'.'+key] = tile[key];
    }

    app.models.Region.update({
        pos: app.models.Tile.getRegionByTileId(req.params.id)
    },{ "$set": $set},function(err,updated){

        if(err) console.log(err);

        res.json(true);

    });


});

app.get('/api/editor/tiletypes', function (req, res) {

    app.services.AssetsManager.getTileTypesList(function(err,tiles){
        res.json(tiles);
    });

});

app.put('/api/editor/tiletypes/:id', function (req, res) {

    app.services.AssetsManager.updateTileType(null,req.body,function(err,tileType){
        res.json(tileType);
    });

});

app.get('/api/editor/thingtypes', function (req, res) {

    app.services.AssetsManager.getThingTypesList(function(err,tiles){
        res.json(tiles);
    });

});


app.post('/api/editor/upload', function(req,res, next){

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
    app.services.AssetsManager.updateTileType(file,req.query,function(err,tileType){

        res.json(tileType);

    });



});