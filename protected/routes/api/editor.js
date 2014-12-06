var async = require('async');


app.get('/api/editor/resetWorld', function (req, res) {

    res.writeHead(200, {
        'Content-Type': 'text/html'
        , 'Transfer-Encoding': 'chunked'
    });

    var fromX = parseInt(req.query.fromX || -30);
    var toX = parseInt(req.query.toX || 30);
    var fromY = parseInt(req.query.fromY || -30);
    var toY = parseInt(req.query.toY || 30);

    var total = (toX - fromX + 1) * (toY - fromY + 1);

    res.write("Creating " + total + " tiles<br>");

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

    app.models.Tile.remove({},function(err) {

        if(err) console.log(err);

        var start = new Date();

        var count = 0;
        var nextPerc = 1;

        res.write("Adding Tiles...<br>");

        var ping = setInterval(function(){
            res.write('<span></span>');
        },30000);

        var tile;
        var x = fromX;
        var y = fromY;

        async.whilst(function(){
            return x < toX || y < toY;
        },function(done){

            tile = new app.models.Tile({
                pos: [x, y],
                type: 1
            });
            tile.save(done);

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


app.get('/api/editor/tiles', function (req, res) {

    var start = new Date();

    var query = {};

    if(req.param('rect')){
        query.pos = {
            $geoWithin : {
                $box : JSON.parse(req.param('rect'))
            }
        }
    }else if(req.param('rect1') && req.param('rect2')){
        query.$or = [
            {
                pos: {
                    $geoWithin: {
                        $box: JSON.parse(req.param('rect1'))
                    }
                }
            },
            {
                pos: {
                    $geoWithin: {
                        $box: JSON.parse(req.param('rect2'))
                    }
                }
            }
        ]
    }else if(req.param('point')){
        var point = JSON.parse(req.param('point'));
        query.pos = {
            $geoWithin : {
                $box : [point, point]
            }
        }

    //poor performance! use rect when possible!
    }else if(req.param('points')){
        query.$or = [];

        var points = JSON.parse(req.param('points'));

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

    app.models.Tile.collection.find(query).toArray(function(err,tiles){
        if(err) console.log(err);
        console.log("Fetched " + tiles.length + " documents in " + (new Date() - start) + "ms");
        res.json(tiles);
    });

});

app.put('/api/editor/tiles/:id', function (req, res) {

    var tile = req.body;

    //prevent position update
    delete tile.pos;

    app.models.Tile.update({_id: req.param("id")},tile,function(err,updated){

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