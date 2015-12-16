
server.get('/', function (req, res) {

    if(req.session.player) return res.render('index',{player: req.session.player});
    else return res.redirect('/login');

});

server.get('/login', function (req, res) {

    if(req.session && req.session.player) return res.redirect('/');

    res.render('login');

});

// SIGNUP
server.post('/login', function (req, res) {

    var username = req.body.username;

    server.models.Player.findOne({name: username},function(err, player){
        if(err) console.log(err);
        if(!player){

            player = new server.models.Player({
                name: username,
                rx: 5,
                ry: 5,
                x: 55,
                y: 55,
                slot: 0
            });
            player.save(function(err){
                if(err) console.log(err);

            });

        }

        req.session.player = player;

        var regionId = shared.mapHelper.regionIdByTileXY(player.x,player.y);

        server.io.to(regionId).emit(shared.events.PLAYER_JOIN,{
            id: server.shortId.generate(),
            actor: player._id,
            data: {
                at: {x: player.x, y: player.y, slot: player.slot},
                player: player
            }
        });

        return res.redirect('/');

    });

});

server.get('/logout', function (req, res) {

    if(req.session) req.session.destroy();

    return res.redirect('/login');

});

server.get('/map_editor', function (req, res) {

    server.models.World.findOne({name: "zombietown"}, function(err, world) {

        res.render('map_editor',{world: world});

    });

});

server.get('/assets_manager', function (req, res) {

    res.render('assets_manager');

});

module.exports = require('require-directory')(module);