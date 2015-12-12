
app.get('/api/player', function (req, res) {

    res.json(req.session.player);


});

app.get('/api/players_around', function (req, res) {

    var centerRegionPos = app.services.Map.regionPosByTile(req.session.player.pos[0],req.session.player.pos[1]);
    var regions = app.services.Map.regionsAroundRegion(centerRegionPos[0],centerRegionPos[1]);

    var query = {region: {$in: regions}};

    app.models.Player.collection.find(query).toArray(function(err,players){
        if(err) console.log(err);
        res.json(players);
    });

});

app.post('/api/player/move', function (req, res) {

    if(!req.body.x || !req.body.y || !req.body.slot) return res.status(400).json("missing x, y or slot");

    var newTilePos = [req.body.x,req.body.y];

    var newSlot = req.body.slot;
    var newRegionPos = app.services.Map.regionPosByTile(newTilePos[0],newTilePos[1]);

    var prevTilePos = req.session.player.pos;
    var prevSlot = req.session.player.slot;
    var prevRegionId = app.services.Map.regionIdByTile(prevTilePos[0],prevTilePos[1]);

    //add player to the new position (check if slot is empty)
    app.models.Region.insertInEmptySlot(newTilePos[0],newTilePos[1],newSlot,{type: "Player",_id: req.session.player._id},function(err,c){
        if(err) app.log.error("api/player/move-insertinemptyslot ",err);
        if(err || !c) return res.status(405).json("slot is already ocupied");

        //remove player from previous position
        app.models.Region.clearSlot(prevTilePos[0],prevTilePos[1],prevSlot,function(err,c){
            if(err) app.log.error("api/player/move-clearslot",err);

            //update player positioning
            app.models.Player.update({_id: req.session.player._id},{region: newRegionPos, pos: newTilePos, slot: newSlot},function(err){
                if(err) app.log.error("api/player/move-player-update",err);

                req.session.player.region = newRegionPos;
                req.session.player.pos = newTilePos;
                req.session.player.slot = newSlot || 0;

                var regionId = app.services.Map.regionIdByTile(newTilePos[0],newTilePos[1]);
                var moveData = {
                    id: app.shortId.generate(),
                    actor: req.session.player._id,
                    from: {pos: prevTilePos, slot: prevSlot},
                    to: {pos: req.session.player.pos, slot: req.session.player.slot},
                    player: req.session.player._id
                };

                app.io.to(regionId).emit(app.shared.Events.PLAYER_MOVE,moveData);

                if(regionId!==prevRegionId){
                    app.io.to(prevRegionId).emit(app.shared.Events.PLAYER_MOVE,moveData);
                }

                res.json(true);

            });

        });

    });


});