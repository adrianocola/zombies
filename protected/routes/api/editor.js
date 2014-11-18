var jf = require('jsonfile');
var fs = require('fs-extra');


app.get('/api/editor/resetWorld', function (req, res) {

    var start = new Date();

    var fromX = req.query.fromX || -30;
    var toX = req.query.toX || 30;
    var fromY = req.query.fromY || -30;
    var toY = req.query.toY || 30;

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

    app.models.Tile.remove({}, function(err) {

        if(err) console.log(err);

        for(var x = fromX; x <= toX; x++){
            for(var y = fromY; y <= toY; y++){
                var slot = new app.models.Tile({
                    pos: [x,y],
                    type: 1
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


app.get('/api/editor/tiles', function (req, res) {

    var req_tiles = JSON.parse(req.query.tiles) || [];

    app.models.Tile.collection.find({pos: {$in: req_tiles }}).toArray(function(err,tiles){

        if(err) console.log(err);
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

    AssetsManager.getTileTypesList(function(err,tiles){
        res.json(tiles);
    });

});

app.put('/api/editor/tiletypes/:id', function (req, res) {

    AssetsManager.updateTileType(null,req.body,function(err,tileType){
        res.json(tileType);
    });

});


app.post('/api/editor/upload', function(req,res, next){

    var file = req.files.tileupload;

    if(!file){
        res.status(500).send("Erro ao realizar upload de arquivo!");
    }

    //o limite máximo é 100k para qualquer imagem
    if(file.size > 102400){
        return res.status(500).send("Imagem não pode ser maior que 5MB!");
    }else if(file.mimetype != "image/png"){
        return res.status(500).send("Só são permitidas imagens nos formato png!");
    }

    delete req.query.tileupload;
    AssetsManager.updateTileType(file,req.query,function(err,tileType){

        res.json(tileType);

    });



});