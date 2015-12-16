
server.get('/api/player', function (req, res) {

    res.json(req.session.player);


});

server.get('/api/players_around', function (req, res) {

    var centerRegionXY = shared.mapHelper.regionXYByTileXY(req.session.player.x,req.session.player.y);
    var regions = shared.mapHelper.regionsAroundRegion(centerRegionXY.x,centerRegionXY.y);

    var query = {$or: []};
    for(var i=0; i<regions.length;i++){
        query.$or.push({rx: regions[i].x, ry: regions[i].y});
    }

    server.models.Player.collection.find(query).toArray(function(err, players){
        if(err) console.log(err);
        res.json(players);
    });

});

server.post('/api/player/move', function (req, res) {

    if(!req.body.x || !req.body.y || !req.body.slot) return res.status(400).json("missing x, y or slot");

    var newX = parseInt(req.body.x);
    var newY = parseInt(req.body.y);
    var newSlot = parseInt(req.body.slot);
    var newRegionXY = shared.mapHelper.regionXYByTileXY(newX,newY);

    var prevX = req.session.player.x;
    var prevY = req.session.player.y;
    var prevSlot = req.session.player.slot;
    var prevRegionId = shared.mapHelper.regionIdByTileXY(prevX,prevY);

    //add player to the new position (check if slot is empty)
    server.models.Region.insertInEmptySlotStand(newX,newY,newSlot,{_id: req.session.player._id, entity: "player", type: 1},function(err, c){
        if(err) server.log.error("api/player/move-insertinemptyslot ",err);
        if(err || !c) return res.status(405).json("slot is already ocupied");

        //remove player from previous position
        server.models.Region.clearSlotStand(prevX,prevY,prevSlot,function(err, c){
            if(err) server.log.error("api/player/move-clearslot",err);

            //update player positioning
            server.models.Player.update({_id: req.session.player._id},{rx: newRegionXY.x, ry: newRegionXY.y, x: newX, y: newY, slot: newSlot},function(err){
                if(err) server.log.error("api/player/move-player-update",err);

                req.session.player.region = newRegionXY;
                req.session.player.x = newX;
                req.session.player.y = newY;
                req.session.player.slot = newSlot;

                var regionId = shared.mapHelper.regionIdByTileXY(newX,newY);
                var moveData = {
                    id: server.shortId.generate(),
                    actor: req.session.player._id,
                    data: {
                        from: {x: prevX, y: prevY, slot: prevSlot},
                        to: {x: newX, y: newY, slot: req.session.player.slot},
                        player: req.session.player
                    }
                };

                server.io.to(regionId).emit(shared.events.PLAYER_MOVE,moveData);

                if(regionId!==prevRegionId){
                    server.io.to(prevRegionId).emit(shared.events.PLAYER_MOVE,moveData);
                }

                res.json(true);

            });

        });

    });


});