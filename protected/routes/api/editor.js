var async = require('async');
var sizeof = require('object-sizeof');

app.get('/api/editor/resetWorld', function (req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/html'
        , 'Transfer-Encoding': 'chunked'
    });

    var fromX = parseInt(req.query.fromX || -5);
    var toX = parseInt(req.query.toX || 5);
    var fromY = parseInt(req.query.fromY || -5);
    var toY = parseInt(req.query.toY || 5);
    var size = parseInt(req.query.size || 11);

    var total = (toX - fromX + 1) * (toY - fromY + 1);

    res.write("Creating " + total + " regions ( " + (total*(11*11)) + "tiles)<br>");

    app.models.World.findOne({name: "zombietown"}, function(err, world) {

        if(!world){
            world = new app.models.World({name: "zombietown"});
        }

        world.top = fromY;
        world.right = toX;
        world.bottom = toY;
        world.left = fromX;

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
        var x = fromX;
        var y = fromY;

        async.whilst(function(){
            return x <= toX && y <= toY;
        },function(done){

            region = new app.models.Region({
                pos: [x, y]
            });

            for(var i=0;i<size;i++){
                for(var j=0;j<size;j++) {
                    region.tiles.push({type: 1, pos: [(x*size)+i,(y*size)+j]});
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
                y=fromY;
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

    var query = {};

    if(req.query.rect){
        query.pos = {
            $geoWithin : {
                $box : JSON.parse(req.query.rect)
            }
        }
    }else if(req.query.rect1 && req.query.rect2){
        query.$or = [
            {
                pos: {
                    $geoWithin: {
                        $box: JSON.parse(req.query.rect1)
                    }
                }
            },
            {
                pos: {
                    $geoWithin: {
                        $box: JSON.parse(req.query.rect2)
                    }
                }
            }
        ]
    }else if(req.query.point){
        var point = JSON.parse(req.query.point);
        query.pos = {
            $geoWithin : {
                $box : [point, point]
            }
        }

        //poor performance! use rect when possible!
    }else if(req.query.points){
        query.$or = [];

        var points = JSON.parse(req.query.points);

        for(var i=0; i<points.length; i++){
            query.$or.push(
                {
                    pos: {
                        $geoWithin: {
                            $box : [points[i], points[i]]
                        }
                    }
                }
            );
        }
    }

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