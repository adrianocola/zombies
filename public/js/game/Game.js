

//
//X e Y devem sempre fazer referencia a posição no map (em pixels)
//tileX e tileY devem fazer referencia a posicao do tile (em coordenadas x e y)
//sempre deixar explicito quando estiver fazendo referencia relativa de tileX e tileY (movimento)


/**
 * The game map is always a square!
 * @param options
 * @constructor
 */
ZT.Game = function(options){

    _.extend(this, Backbone.Events);

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

    this.totalSize = 2*this.visibleSize-1; //total number of tiles to show
    this.width = this.totalSize*this.tileSize; //total game width (in px)
    this.height = this.totalSize*this.tileSize; //total game height (in px)

    this.tileTypes = new TileTypesCollection();
    this.playerModel = new PlayerModel();

    var game = this;

    //start point
    this.start = function start(){

        async.parallel([
            function(cb){
                game.tileTypes.fetch({success: cb});
            },
            function(cb){
                game.playerModel.fetch({success: cb});
            }
        ], boot);

    };

    function boot(){

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

        game.phaser.load.image('player', 'img/player2.png');
        game.phaser.load.image('zombie', 'img/zombie.png');
        game.phaser.load.spritesheet('walking', 'img/walking.png', 16, 16, 4);


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

        var mapCenterX = game.tileSize * game.playerModel.x;
        var mapCenterY = game.tileSize * game.playerModel.y;

        var initX = - game.width/2 + game.tileSize/2 + mapCenterX;
        var initY = - game.height/2 + game.tileSize/2 + mapCenterY;

        game.phaser.world.setBounds(initX,initY,game.width,game.height);

        game.backgroundLayer = game.phaser.add.group();
        game.shadowLayer = game.phaser.add.group();
        game.constructionLayer = game.phaser.add.group();
        game.thingLayer = game.phaser.add.group();
        game.hudLayer = game.phaser.add.group();

        game.phaser.stage.backgroundColor = '#000000';

        game.map = new ZT.Map({
            game: game,
            totalTiles: game.totalSize,
            tileSize: game.tileSize,
            slotSize: game.slotSize,
            centerX: game.playerModel.x,
            centerY: game.playerModel.y,
            regionTiles: game.regionTiles
        });

        game.marker = game.phaser.make.graphics();
        game.marker.lineStyle(1, 0xffffff, 1);
        game.marker.drawRect(0, 0, game.slotSize, game.slotSize);
        game.hudLayer.add(game.marker);

        //var area = 600;
        //for(var i=0;i<1000;i++){
        //    var thing = new ZT.Thing({x: _.random(-area,area), y:_.random(-area,area), game:game, image:"zombie", shadow: false, goback: true});
        //}

        game.player = new ZT.Thing({x: game.playerModel.x * game.tileSize, y: game.playerModel.y * game.tileSize, game:game, image:"walking", shadow: true, animation: 'walk'});

        game.phaser.input.addMoveCallback(function(){
            game.marker.x = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldX, game.slotSize);
            game.marker.y = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldY, game.slotSize);
        }, this);

        game.phaser.input.onDown.add(function(){
            var markerTile = game.map.getTileWorldXY(game.marker.x,game.marker.y);
            console.log(game.map.getSlotWorldXY(game.marker.x,game.marker.y));
            var playerTile = game.map.getTileWorldXY(game.player.sprite.x,game.player.sprite.y);

            game.player.moveToXY(game.marker.x,game.marker.y);
            game.moveRelative(markerTile.x-playerTile.x,markerTile.y-playerTile.y);

        }, this);

        game.cursors = game.phaser.input.keyboard.createCursorKeys();

        game.phaser.camera.x = game.player.sprite.x;
        game.phaser.camera.y = game.player.sprite.y;

        //game.phaser.camera.follow(game.player.sprite);
        //game.phaser.camera.deadzone = new Phaser.Rectangle(game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.2, game.visibleSize*game.tileSize*0.2);

    }

    function update(){

        game.phaser.physics.arcade.collide(game.player.sprite, game.thingLayer, function(){

        }, null, this);

        game.phaser.physics.arcade.collide(game.player.sprite, game.constructionLayer, function(){

        }, null, this);

        if (game.cursors.left.isDown)
        {
            game.phaser.camera.x -= 4;
        }
        else if (game.cursors.right.isDown)
        {
            game.phaser.camera.x += 4;
        }

        if (game.cursors.up.isDown)
        {
            game.phaser.camera.y -= 4;
        }
        else if (game.cursors.down.isDown)
        {
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

ZT.Game.prototype.moveRelative = function(relX, relY){
    game.playerModel.moveTo(game.playerModel.x + relX, game.playerModel.y + relY);
    game.map.moveRelative(relX, relY);
    game.phaser.world.setBounds(game.phaser.world.bounds.x + (relX * this.tileSize),game.phaser.world.bounds.y + (relY * this.tileSize),game.width,game.height);
};

ZT.Game.prototype.destroy = function(){

};