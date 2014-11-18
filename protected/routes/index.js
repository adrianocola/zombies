
app.get('/', function (req, res) {
    res.render('index');
})

app.get('/map_editor', function (req, res) {

    app.models.World.findOne({name: "zombietown"}, function(err, world) {

        res.render('map_editor',{world: world});

    });

});

app.get('/assets_manager', function (req, res) {

    res.render('assets_manager');

});

module.exports = require('require-directory')(module);