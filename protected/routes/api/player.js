

app.get('/api/player', function (req, res) {

    res.json(req.session.player);


});

app.post('/api/player/move', function (req, res) {

    if(!req.body.x || !req.body.y || !req.body.slot) return res.status(400).json("missing x, y or slot");

    app.models.Player.update({_id: req.session.player._id},{pos: [req.body.x,req.body.y], slot: req.body.slot},function(err){

        if(err) console.log(err);

        req.session.player.pos = [req.body.x,req.body.y];
        req.session.player.slot = req.body.slot || 0;

        res.json(true);

    });


});