ZT.Game = function(options){

    this.options = options || {};

    this.visibleSize = this.options.visibleSize || 11;
    this.tileSize = this.options.visibleSize || 48;
    this.totalSize = 2*this.visibleSize-1;
    this.sideSize = this.visibleSize -1;
    this.slotSize = this.tileSize/3;

    this.width = this.totalSize*this.tileSize;
    this.height = this.totalSize*this.tileSize;

    this.tileTypes = new TileTypesCollection();
    this.playerModel = new PlayerModel();

    var game = this;

    //start point
    this.start = function start(){

        var count = 2;
        var loaded = function(){
            count--;
            if(count <= 0){
                boot();
            }
        }

        this.tileTypes.fetch({success: function(col,resp){
            loaded();
        }});

        this.playerModel.fetch({success: function(model,resp){
            loaded();
        }});

    }

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
            },
            forceSetTimeOut: true
        }

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
        game.phaser.load.spritesheet('walking', 'img/walking.png', 16, 16, 4);


        //to calc FPS
        game.phaser.time.advancedTiming = true;
        //force the game to work with 1 FPS in inactive tabs
        game.phaser.time.timeCap = 1000;
        game.phaser.time.deltaCap = 1000;

    }

    function create(){

        game.phaser.onBlur.add(function(){
            game.isPaused = true;
        },this);
        //
        game.phaser.onFocus.add(function(){
            game.isPaused = false;
        },this);

        game.phaser.onPause.add(function(){},this);

        game.phaser.onResume.add(function(){},this);

        game.phaser.stage.disableVisibilityChange = true;

        game.phaser.physics.startSystem(Phaser.Physics.ARCADE);

        game.phaser.world.setBounds(-game.width/2 + game.tileSize/2 ,-game.height/2 + game.tileSize/2,game.width,game.height);

        game.backgroundLayer = game.phaser.add.group();
        game.shadowLayer = game.phaser.add.group();
        game.constructionLayer = game.phaser.add.group();
        game.hudLayer = game.phaser.add.group();

        game.phaser.stage.backgroundColor = '#000000';

        game.map = new ZT.Map({
            game: game,
            width: game.totalSize,
            height: game.totalSize,
            tileWidth: game.tileSize,
            tileHeight: game.tileSize,
            centerWorldX: 0,
            centerWorldY: 0,
            realCenterX: 0,
            realCenterY: 0
            //centerWorldX: -game.tileSize * game.playerModel.x,
            //centerWorldY: -game.tileSize * game.playerModel.y,
            //realCenterX: game.playerModel.x,
            //realCenterY: game.playerModel.y
        });

        game.marker = game.phaser.make.graphics();
        game.marker.lineStyle(1, 0xffffff, 1);
        game.marker.drawRect(0, 0, game.slotSize, game.slotSize);
        game.hudLayer.add(game.marker);

        game.playerShadow = game.phaser.add.sprite(game.tileSize/2 -2, game.tileSize/2 -2, 'walking');
        game.playerShadow.tint = 0x000000;
        game.playerShadow.alpha = 0.6;
        game.playerShadow.anchor.setTo(0.5, 0.5);
        game.playerShadow.scale.setTo(0.75, 0.75);

        game.player = game.phaser.add.sprite(game.tileSize/2, game.tileSize/2, 'walking');
        game.player.anchor.setTo(0.5, 0.5);
        game.player.scale.setTo(0.75, 0.75);
        game.anim = game.player.animations.add('walk');

        game.phaser.physics.arcade.enable(game.player,Phaser.Physics.ARCADE);
        game.player.body.allowRotation = false;


        game.phaser.input.addMoveCallback(function(){
            game.marker.x = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldX, game.slotSize);
            game.marker.y = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldY, game.slotSize);
        }, this);

        game.phaser.input.onDown.add(function(){
            var markerTile = game.map.getTileWorldXY(game.marker.x,game.marker.y);

            var playerTile;
            if(game.player.target){
                playerTile = game.map.getTileWorldXY(game.player.target.x,game.player.target.y);
            }else{
                playerTile = game.map.getTileWorldXY(game.player.x,game.player.y);
            }

            game.player.target = new Phaser.Point(game.marker.x + game.slotSize/2, game.marker.y+ game.slotSize/2);
            game.player.rotation = game.phaser.physics.arcade.moveToXY(game.player, game.player.target.x, game.player.target.y, 30, 1000);

            game.moveRelative(markerTile.x-playerTile.x,markerTile.y-playerTile.y);
            game.anim.play(7, true);

        }, this);

        game.cursors = game.phaser.input.keyboard.createCursorKeys();

        game.phaser.camera.x = -game.width/4 + game.tileSize/4;
        game.phaser.camera.y = -game.height/4 + game.tileSize/4;

        //game.phaser.camera.follow(game.player);
        //game.phaser.camera.deadzone = new Phaser.Rectangle(game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.2, game.visibleSize*game.tileSize*0.2);

    }

    function update(){

        game.phaser.physics.arcade.collide(game.player, game.constructionLayer, function(){

        }, null, this);

        game.phaser.physics.arcade.collide(game.constructionLayer, game.constructionLayer, function(){

        }, null, this);

        if(game.player.target){
            //console.log("Y: " + (game.player.y));
            game.player.rotate = game.phaser.physics.arcade.moveToXY(game.player, game.player.target.x, game.player.target.y, 100);
            game.playerShadow.angle = game.player.angle;
            game.playerShadow.x = game.player.x -1;
            game.playerShadow.y = game.player.y -1 ;
            if( Math.abs(game.player.target.x - game.player.x) < 5 && Math.abs(game.player.target.y - game.player.y) < 5){

                game.player.x = game.player.target.x;
                game.player.y = game.player.target.y;

                game.playerShadow.x = game.player.x -1;
                game.playerShadow.y = game.player.y -1 ;

                delete game.player.target;
                game.player.body.velocity.x = 0;
                game.player.body.velocity.y = 0;
                game.anim.stop();
            }
        }

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
        //game.phaser.debug.cameraInfo(game.phaser.camera, game.tileSize, game.tileSize);
        game.phaser.debug.text(game.phaser.time.fps || '--', 2, 14, "#00ff00");
    }

}

ZT.Game.prototype.moveRelative = function(moveX, moveY){
    game.map.move(moveX, moveY);
    game.phaser.world.setBounds(game.phaser.world.bounds.x + (moveX * this.tileSize),game.phaser.world.bounds.y + (moveY * this.tileSize),game.width,game.height);
}

ZT.Game.prototype.destroy = function(){

}