

app.get('/api/player', function (req, res) {

    res.json(req.session.player);


});