

app.get('/api/player', function (req, res) {

    res.json(req.session.player);


});

app.post('/api/player/move', function (req, res) {

    if(!req.body.x || !req.body.y) return res.status(400).json("missing x or y");

    return res.json(true);
    app.models.Player.update({_id: req.session.player._id},{pos: [req.body.x,req.body.y]},function(err){

        if(err) console.log(err);

        req.session.player.pos = [req.body.x,req.body.y];

        res.json(true);

    });


});