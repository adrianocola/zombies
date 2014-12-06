

app.get('/api/player', function (req, res) {

    res.json(req.session.player);


});

app.post('/api/player/move', function (req, res) {

    if(!req.param("point")) return res.status(400).json("missing point");

    app.models.Player.update({_id: req.session.player._id},{pos: JSON.parse(req.param("point"))},function(err){

        if(err) console.log(err);

        res.json(true);

    });


});