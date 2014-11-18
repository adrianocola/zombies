ZT.Game = function(options){

    this.options = options || {};

    this.visibleSize = this.options.visibleSize || 11;
    this.tileSize = this.options.visibleSize || 48;
    this.totalSize = 2*this.visibleSize-1;
    this.sideSize = this.visibleSize -1;

    this.width = this.totalSize*this.tileSize;
    this.height = this.totalSize*this.tileSize;

    var game = this;

    this.start = function start(){

        this.phaser = new Phaser.Game(this.visibleSize*this.tileSize, this.visibleSize*this.tileSize, Phaser.AUTO, 'zombietown', {
            preload: preload,
            create: create,
            update: update,
            render: render,
            paused: function(){ game.phaser.paused = false;}
        });

    }

    function preload(){
        game.phaser.load.image('building', 'tiles/building.png');
        game.phaser.load.image('player', 'img/player2.png');
        game.phaser.load.image('grass', 'tiles/grass.png');
        game.phaser.load.image('grass2', 'tiles/grass2.png');
        game.phaser.load.image('road', 'tiles/road.png');
        game.phaser.load.spritesheet('walking', 'img/walking.png', 16, 16, 4);
    }

    function create(){

        game.phaser.physics.startSystem(Phaser.Physics.ARCADE);

        game.phaser.world.setBounds(-game.width/2 + game.tileSize/2 ,-game.height/2 + game.tileSize/2,game.width,game.height);

        game.backgroundLayer = game.phaser.add.group();
        game.hudLayer = game.phaser.add.group();

        game.phaser.stage.backgroundColor = '#008000';

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
        });

        game.marker = game.phaser.make.graphics();
        game.marker.lineStyle(1, 0xffffff, 1);
        game.marker.drawRect(0, 0, game.tileSize, game.tileSize);
        game.hudLayer.add(game.marker);

        game.shadow = game.phaser.make.sprite(96, 96, 'building');
        game.shadow.tint = 0x000000;
        game.shadow.alpha = 0.6;
        game.shadow.scale.setTo(0.70, 0.70);
        game.backgroundLayer.add(game.shadow);

        game.building = game.phaser.make.sprite(98,98, 'building');
        game.phaser.physics.arcade.enable(game.building,Phaser.Physics.ARCADE);
        game.building.body.immovable = true;
        game.building.scale.setTo(0.72, 0.72);
        game.backgroundLayer.add(game.building);


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
            game.marker.x = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldX, game.tileSize);
            game.marker.y = game.phaser.math.snapToFloor(game.phaser.input.activePointer.worldY, game.tileSize);
        }, this);

        game.phaser.input.onDown.add(function(){
            var markerTile = game.map.getTileWorldXY(game.marker.x,game.marker.y);
            if(markerTile) console.log(markerTile.x + "," + markerTile.y);


            var playerTile;
            if(game.player.target){
                playerTile = game.map.getTileWorldXY(game.player.target.x,game.player.target.y);
            }else{
                playerTile = game.map.getTileWorldXY(game.player.x,game.player.y);
            }

            game.player.target = new Phaser.Point(markerTile.worldX + game.tileSize/2, markerTile.worldY + game.tileSize/2);
            game.player.rotation = game.phaser.physics.arcade.moveToXY(game.player, game.player.target.x, game.player.target.y, 30, 1000);

            game.moveRelative(markerTile.x-playerTile.x,markerTile.y-playerTile.y);
            game.anim.play(7, true);

        }, this);

        game.cursors = game.phaser.input.keyboard.createCursorKeys();

        game.phaser.camera.x = -game.width/4 + game.tileSize/4;
        game.phaser.camera.y = -game.height/4 + game.tileSize/4;

        game.phaser.camera.follow(game.player);
        game.phaser.camera.deadzone = new Phaser.Rectangle(game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.4, game.visibleSize*game.tileSize*0.2, game.visibleSize*game.tileSize*0.2);
    }

    function update(){

        //if colided with background
        game.phaser.physics.arcade.collide(game.player, game.backgroundLayer, function(){

        }, null, this);

        if(game.player.target){
            game.player.rotate = game.phaser.physics.arcade.moveToXY(game.player, game.player.target.x, game.player.target.y, 100);
            game.playerShadow.angle = game.player.angle;
            game.playerShadow.x = game.player.x -1;
            game.playerShadow.y = game.player.y -1 ;
            if( Math.abs(game.player.target.x - game.player.x) < 5 && Math.abs(game.player.target.y - game.player.y) < 5){
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
        //game.phaser.debug.cameraInfo(phaser.camera, this.tileSize, this.tileSize);
    }

}

ZT.Game.prototype.moveRelative = function(moveX, moveY){
    game.map.move(moveX, moveY);
    game.phaser.world.setBounds(game.phaser.world.bounds.x + (moveX * this.tileSize),game.phaser.world.bounds.y + (moveY * this.tileSize),game.width,game.height);
}

ZT.Game.prototype.destroy = function(){

}