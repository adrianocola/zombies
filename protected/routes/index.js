
app.get('/', function (req, res) {
    res.render('index');
})

app.get('/editor', function (req, res) {

    app.models.World.findOne({name: "zombietown"}, function(err, world) {

        app.models.TileType.find({}, function(err, tileTypes) {

            res.render('editor',{world: world, tileTypes: tileTypes});

        });

    });


})

module.exports = require('require-directory')(module);