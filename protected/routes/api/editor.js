
app.get('/api/editor/resetWorld', function (req, res) {

    var start = new Date();

    var fromX = req.query.fromX || 0;
    var toX = req.query.toX || 0;
    var fromY = req.query.fromY || 0;
    var toY = req.query.toY || 0;

    var total = (toX - fromX + 1) * (toY - fromY + 1);

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

    app.models.TileType.findOne({name: "grass"}, function(err, defaultType) {

        if(!defaultType){
            defaultType = new app.models.TileType({name: "grass"});
            defaultType.save();
        }

        app.models.Tile.remove({}, function(err) {

            if(err) console.log(err);

            for(var x = fromX; x <= toX; x++){
                for(var y = fromY; y <= toY; y++){
                    var slot = new app.models.Tile({
                        pos: [x,y],
                        type: defaultType
                    });
                    slot.save(function(err){
                        if(err) console.log(err);

                        total--;
                        if(total===0){
                            res.send("Finalizado em: " + (new Date() - start) + "ms");
                        }

                    });
                }
            }

        });


    });

});


app.get('/api/editor/tiles', function (req, res) {

    var req_tiles = JSON.parse(req.query.tiles) || [];

    app.models.Tile.collection.find({pos: {$in: req_tiles }}).toArray(function(err,tiles){

        if(err) console.log(err);
        res.json(tiles);

    });





});