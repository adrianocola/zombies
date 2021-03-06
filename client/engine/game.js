//IMPLEMENTAR OUTRO PLAYER SAINDO E ENTRANDO NAS MINHAS REGIÕES
//ESTRUTURAR MELHOR EVENTOS (considerar um esquema de RPC)
//IMPLEMENTAR CALLBACK NO MOVEPLAYER DO MODEL PARA VALIDAR SE MOVIMENTO DEU CERTOo
//MELHOR METODO DE MOVETO DA THING PARA PASSAR UM SLOT!
//NÃO PERMITIR QUE PLAYERS SE COLIDAM (o player empurrado desliza longe)

//Event structure
// actor: user that generated event (or system)
// event: event type/name
// id: event id
// data: event data


//Map events:
// droped thing on map
// picked up thing from map
// thing destroyed
// thing moved
// thing executed animation
// player moved (slow, normal, fast)
// player died
// player showed in region
// player left region
// player rotated (?)
// player attacked
// zombie moved
// zombie attacked
// zombie died



//
//X e Y devem sempre fazer referencia a posição no map (em pixels)
//tileX e tileY devem fazer referencia a posicao do tile (em coordenadas x e y)
//sempre deixar explicito quando estiver fazendo referencia relativa de tileX e tileY (movimento)

var async = require('async');
var EventEmitter = require('ampersand-events');

/**
 * The game map is always a square!
 * @param options
 * @constructor
 */
var Game = function(options){

    _.extend(this, EventEmitter);

    //default values
    this.options = _.extend({
        visibleTiles: 11, //number of tiles visible (square). OBS: must be odd
        regionTiles: 11, //number of tiles in a region (square)
        tileSize: 48, //tile width and height (in px)
        slotSize: 16 //slot width and height (in px)
    },options || {});

    this.visibleSize = this.options.visibleTiles;
    this.regionTiles = this.options.regionTiles;
    this.tileSize = this.options.tileSize;
    this.slotSize = this.options.slotSize;

    this.tileSlots = this.tileSize/this.slotSize;

    this.totalSize = 2*this.visibleSize-1; //total number of tiles to show
    this.width = this.totalSize*this.tileSize; //total game width (in px)
    this.height = this.totalSize*this.tileSize; //total game height (in px)

    this.tileTypes = new client.models.TileTypeCollection();
    this.thingTypes = new client.models.ThingTypeCollection();
    this.playersModels = new client.models.PlayerCollection();
    this.playerModel = new client.models.PlayerModel();
    this.players = {};

    this.events = new client.engine.Events({game: this});
    this.events.handleEvents();

    var game = this;

    //start point
    this.start = function start(){

        async.parallel([
            function(cb){
                game.tileTypes.fetch({success: cb});
            },
            function(cb){
                game.thingTypes.fetch({success: cb});
            },
            function(cb){
                game.playerModel.fetch({success: cb});
            },
            function(cb){
                $.ajax('/api/players_around',{success: function(data){
                    for(var i=0;i<data.length;i++){
                        game.playersModels.add(data[i]);
                    }
                }})
            }
        ], boot);

    };

    function boot(){

        game.playersModels.add(game.playerModel);

        var game_config = {
            width: game.visibleSize*game.tileSize,
            height: game.visibleSize*game.tileSize,
            renderer: Phaser.AUTO,
            parent: 'zombietown',
            state:  {
                preload: preload,
                create: create,
                update: update,
                render: render,
                pause: function(){
                    console.log("PPP");
                }
            }
        };

        game.phaser = new Phaser.Game(game_config);

    }

    function preload(){

        game.phaser.raf.forceSetTimeOut = true;

        //load tileTypes
        for(var i=0; i<game.tileTypes.length;i++){
            var tileType = game.tileTypes.at(i);
            game.phaser.load.image(tileType.get('name'), tileType.tileImgPath());
        }

        game.phaser.load.image('person', '/things/person.png');
        game.phaser.load.image('zombie', '/things/zombie.png');
        game.phaser.load.spritesheet('walking', '/things/walking.png', 16, 16, 4);


        //to calc FPS
        game.phaser.time.advancedTiming = true;

    }

    function create(){

        //game.phaser.time.slowMotion = 0.25;

        game.phaser.onBlur.add(function(){
            console.log("BLUR");
            game.isInactive = true;
        },this);
        //
        game.phaser.onFocus.add(function(){
            console.log("FOCUS");
            game.isInactive = false;
        },this);

        game.phaser.onPause.add(function(){},this);

        game.phaser.onResume.add(function(){},this);

        game.phaser.stage.disableVisibilityChange = true;

        game.phaser.physics.startSystem(Phaser.Physics.ARCADE);

        var mapCenterX = game.tileSize * game.playerModel.get("x");
        var mapCenterY = game.tileSize * game.playerModel.get("y");

        var initX = - game.width/2 + game.tileSize/2 + mapCenterX;
        var initY = - game.height/2 + game.tileSize/2 + mapCenterY;

        game.phaser.world.setBounds(initX,initY,game.width,game.height);

        game.backgroundLayer = game.phaser.add.group();
        game.gridLayer = game.phaser.add.group();
        game.shadowLayer = game.phaser.add.group();
        game.thingLayer = game.phaser.add.group();
        game.playerLayer = game.phaser.add.group();
        game.constructionLayer = game.phaser.add.group();
        game.hudLayer = game.phaser.add.group();

        game.graphics = game.phaser.make.graphics();
        game.graphics.lineStyle(1, 0x888888, 1);
        game.graphics.alpha = 0.3;
        game.gridLayer.add(game.graphics);

        game.phaser.stage.backgroundColor = '#000000';

        game.map = new client.engine.Map({
            game: game,
            totalTiles: game.totalSize,
            tileSize: game.tileSize,
            slotSize: game.slotSize,
            centerX: game.playerModel.get("x"),
            centerY: game.playerModel.get("y"),
            regionTiles: game.regionTiles
        });

        game.marker = game.phaser.make.graphics();
        game.marker.lineStyle(1, 0xffffff, 1);
        game.marker.drawRect(0, 0, game.slotSize, game.slotSize);
        game.hudLayer.add(game.marker);

        //once the map finished loading tiles, add user
        game.map.once('loaded',function(){
            game.player = new client.engine.Thing({tile: game.map.getTileByTileXY(game.playerModel.x,game.playerModel.y), slot: game.playerModel.slot, model: game.playerModel, game:game, image:"walking", animation: 'walk'});
            //game.phaser.camera.follow(game.player.sprite);
            game.playerLayer.add(game.player.sprite);

            game.playersModels.each(function(playerModel){
                if(playerModel.id === game.playerModel.id) return;
                var player = new client.engine.Thing({tile: game.map.getTileByTileXY(playerModel.x,playerModel.y), slot: playerModel.slot, model: playerModel, game:game, image:"walking", animation: 'walk'});
                game.playerLayer.add(player.sprite);
                game.players[playerModel.id] = player;
            });

        });

        game.phaser.input.addMoveCallback(function(){
            game.marker.x = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldX, game.slotSize);
            game.marker.y = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldY, game.slotSize);
        }, this);

        game.phaser.input.onDown.add(function(){
            var markerTile = game.map.getTileByWorldXY(game.marker.x,game.marker.y);
            var slot = game.map.getTileSlotByWorldXY(game.marker.x,game.marker.y);
            var playerTile = game.map.getTileByWorldXY(game.player.sprite.x,game.player.sprite.y);

            game.player.moveToXY(game.marker.x+game.slotSize/2,game.marker.y+game.slotSize/2);
            game.moveRelative(markerTile.x-playerTile.x,markerTile.y-playerTile.y,slot);

        }, this);

        game.cursors = game.phaser.input.keyboard.createCursorKeys();

        //game.phaser.camera.x = game.player.sprite.x + game.tileSize;
        //game.phaser.camera.y = game.player.sprite.y + game.tileSize;


        //game.phaser.camera.deadzone = new Phaser.Rectangle(game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.2, game.visibleSize*game.tileSize*0.2);

    }

    function update(){

        if(game.player){
            game.phaser.physics.arcade.collide(game.playerLayer, game.thingLayer);
        }

        //game.phaser.physics.arcade.collide(game.player.sprite, game.constructionLayer, function(){
        //
        //}, null, this);

        if (game.cursors.left.isDown){
            game.phaser.camera.x -= 4;
        }else if (game.cursors.right.isDown){
            game.phaser.camera.x += 4;
        }

        if (game.cursors.up.isDown){
            game.phaser.camera.y -= 4;
        }else if (game.cursors.down.isDown){
            game.phaser.camera.y += 4;
        }

    }

    function render(){

        //debug deadzone (only in CANVAS mode)
        //var zone = game.phaser.camera.deadzone;
        //game.phaser.context.fillStyle = 'rgba(255,0,0,0.6)';
        //game.phaser.context.fillRect(zone.x, zone.y, zone.width, zone.height);

        //game.phaser.debug.cameraInfo(game.phaser.camera, game.tileSize, game.tileSize);
        game.phaser.debug.text(game.phaser.time.fps || '--', 2, 14, "#00ff00");
    }

};

Game.prototype.moveRelative = function(relX, relY, slot){
    this.playerModel.moveTo(this.playerModel.get("x") + relX, this.playerModel.get("y") + relY, slot);
    this.map.moveRelative(relX, relY);
    this.phaser.world.setBounds(this.phaser.world.bounds.x + (relX * this.tileSize),this.phaser.world.bounds.y + (relY * this.tileSize),this.width,this.height);
};

Game.prototype.destroy = function(){

};

module.exports = Game;