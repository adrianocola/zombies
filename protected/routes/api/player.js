
app.get('/api/player', function (req, res) {

    res.json(req.session.player);


});

app.get('/api/players_around', function (req, res) {

    var centerRegionXY = app.shared.mapHelper.regionXYByTileXY(req.session.player.x,req.session.player.y);
    var regions = app.shared.mapHelper.regionsAroundRegion(centerRegionXY.x,centerRegionXY.y);

    var query = {$or: []};
    for(var i=0; i<regions.length;i++){
        query.$or.push({rx: regions[i].x, ry: regions[i].y});
    }

    app.models.Player.collection.find(query).toArray(function(err,players){
        if(err) console.log(err);
        res.json(players);
    });

});

app.post('/api/player/move', function (req, res) {

    if(!req.body.x || !req.body.y || !req.body.slot) return res.status(400).json("missing x, y or slot");

    var newX = parseInt(req.body.x);
    var newY = parseInt(req.body.y);
    var newSlot = parseInt(req.body.slot);
    var newRegionXY = app.shared.mapHelper.regionXYByTileXY(newX,newY);

    var prevX = req.session.player.x;
    var prevY = req.session.player.y;
    var prevSlot = req.session.player.slot;
    var prevRegionId = app.shared.mapHelper.regionIdByTileXY(prevX,prevY);

    //add player to the new position (check if slot is empty)
    app.models.Region.insertInEmptySlotStand(newX,newY,newSlot,{type: "Player",_id: req.session.player._id},function(err, c){
        if(err) app.log.error("api/player/move-insertinemptyslot ",err);
        if(err || !c) return res.status(405).json("slot is already ocupied");

        //remove player from previous position
        app.models.Region.clearSlotStand(prevX,prevY,prevSlot,function(err, c){
            if(err) app.log.error("api/player/move-clearslot",err);

            //update player positioning
            app.models.Player.update({_id: req.session.player._id},{rx: newRegionXY.x, ry: newRegionXY.y, x: newX, y: newY, slot: newSlot},function(err){
                if(err) app.log.error("api/player/move-player-update",err);

                req.session.player.region = newRegionXY;
                req.session.player.x = newX;
                req.session.player.y = newY;
                req.session.player.slot = newSlot;

                var regionId = app.shared.mapHelper.regionIdByTileXY(newX,newY);
                var moveData = {
                    id: app.shortId.generate(),
                    actor: req.session.player._id,
                    data: {
                        from: {x: prevX, y: prevY, slot: prevSlot},
                        to: {x: newX, y: newY, slot: req.session.player.slot},
                        player: req.session.player
                    }
                };

                app.io.to(regionId).emit(app.shared.events.PLAYER_MOVE,moveData);

                if(regionId!==prevRegionId){
                    app.io.to(prevRegionId).emit(app.shared.events.PLAYER_MOVE,moveData);
                }

                res.json(true);

            });

        });

    });


});