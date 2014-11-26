
app.get('/', function (req, res) {

    var name = req.param("name") || "default";

    if(req.session.player && req.session.player.name !== name){
        req.session.regenerate(function(err){});
    }

    app.models.Player.findOne({name: name},function(err, player){

        if(!player){

            player = new app.models.Player({
                name: name,
                pos: [0,0]
            });
            player.save(function(err){});

        }

        req.session.player = player;

        res.render('index');

    });




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