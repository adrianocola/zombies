
app.get('/', function (req, res) {

    if(req.session.player) return res.render('index',{player: req.session.player});
    else return res.redirect('/login');

});

app.get('/login', function (req, res) {

    if(req.session && req.session.player) return res.redirect('/');

    res.render('login');

});

app.post('/login', function (req, res) {

    var username = req.body.username;

    app.models.Player.findOne({name: username},function(err, player){
        if(err) console.log(err);
        if(!player){

            player = new app.models.Player({
                name: username,
                region: [5,5],
                pos: [55,55],
                slot: 0
            });
            player.save(function(err){
                if(err) console.log(err);

            });

        }

        req.session.player = player;

        var regionId = app.services.Map.regionIdByTile(player.pos[0],player.pos[1]);

        app.io.to(regionId).emit(app.shared.Events.PLAYER_JOIN,{
            id: app.shortId.generate(),
            actor: player._id,
            at: {pos: player.pos, slot: player.slot},
            model: player
        });

        return res.redirect('/');

    });

});

app.get('/logout', function (req, res) {

    if(req.session) req.session.destroy();

    return res.redirect('/login');

});

app.get('/map_editor', function (req, res) {

    app.models.World.findOne({name: "zombietown"}, function(err, world) {

        res.render('map_editor',{world: world});

    });

});

app.get('/assets_manager', function (req, res) {

    res.render('assets_manager');

});

module.exports = require('require-directory')(module);