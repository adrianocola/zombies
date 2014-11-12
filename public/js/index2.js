

$(function(){

    var visibleSize = 11;
    var totalSize = 2*visibleSize-1;
    var sideSize = visibleSize-1;
    var tileSize = 48;

    var target;

    var map,player,tilemap,cursors, marker,o_mcamera;

    var backgroundLayer, hudLayer;

    var oneKey;

    var game = window.game = new Phaser.Game(visibleSize*tileSize, visibleSize*tileSize, Phaser.CANVAS, 'zombietown', { preload: preload, create: create, update: update, render: render, paused: function(){ game.paused = false;} });

    function preload(){
        game.load.image('building', 'img/building.png');
        game.load.image('player', 'img/player2.png');
    }

    function create(){

        game.physics.startSystem(Phaser.Physics.ARCADE);

        //game.world.setBounds(-totalSize/2*tileSize + tileSize/2, -totalSize/2*tileSize + tileSize/2, totalSize*tileSize, totalSize*tileSize);

        game.stage.backgroundColor = '#008000';

        backgroundLayer = game.add.group();

        player = game.add.sprite(totalSize/2*tileSize, totalSize/2*tileSize, 'player');
        //console.log(player);
        //console.log(player.scale);
        player.scale.setTo(0.25, 0.25);
        //player.anchor.setTo(0.5, 0.5);

        game.physics.arcade.enable(player,Phaser.Physics.ARCADE);
        player.body.allowRotation = false;

        //game.camera.follow(player);
        game.camera.focusOnXY(0, 0);

        //  Creates a blank tilemap
        map = game.add.tilemap();


        tilemap = map.create('background', totalSize, totalSize, tileSize, tileSize,backgroundLayer);
        //tilemap = map.create('background', 0, 0, 48, 48,backgroundLayer);

        //  Resize the world
        tilemap.resizeWorld();

        hudLayer = game.add.group();

        //var tileSprite = game.make.tileSprite(0,0,48,48,"building");
        //map.putTile(tileSprite,0,0,'background');




        marker = game.make.graphics();
        marker.lineStyle(1, 0x333333, 1);
        marker.drawRect(0, 0, tileSize, tileSize);
        hudLayer.add(marker);

        //for(var x = -sideSize; x <= sideSize; x++){
        //    for(var y = -sideSize; y <= sideSize; y++){
        //        var tile = new Phaser.Tile(tilemap,(x*y)+y,x,y,48,48);
        //        //map.putTile(tile,x,y);
        //
        //
        //        var m = game.make.graphics();
        //        m.lineStyle(1, 0x888888, 1);
        //        m.drawRect(tile.worldX, tile.worldY, 48, 48);
        //        backgroundLayer.add(m);
        //
        //        var t = game.make.text(tile.worldX + 8, tile.worldY + 16, tile.x + ',' + tile.y, {font: "7pt Arial", fill: "#FFFFFF"});
        //        t.alpha = 0.3;
        //        backgroundLayer.add(t);
        //    }
        //}

        //tilemap.updateMax();
        //tilemap.resizeWorld();

        map.forEach(function(tile){
            var m = game.make.graphics();
            m.lineStyle(1, 0x888888, 1);
            m.drawRect(tile.worldX, tile.worldY, tileSize, tileSize);
            backgroundLayer.add(m);

            //var t = game.make.text(tile.worldX + 8, tile.worldY + 16, tile.x + ',' + tile.y, {font: "7pt Arial", fill: "#FFFFFF"});
            //t.alpha = 0.3;
            //backgroundLayer.add(t);

        },this,0,0,totalSize, totalSize);
        //
        //for(var x = size; x < size+2; x++){
        //    for(var y = size; y < size+2; y++){
        //        var tile = new Phaser.Tile(tilemap,(x*y)+y,x,y,48,48);
        //        map.putTile(tile,x,y,'background');
        //    }
        //}



        cursors = game.input.keyboard.createCursorKeys();

        game.input.addMoveCallback(updateMarker, this);

        oneKey = game.input.keyboard.addKey(Phaser.Keyboard.ONE);

        oneKey.onDown.add(function(){
            //var bounce=game.add.tween(backgroundLayer);
            //bounce.to({x: game.x + 100}, 1000);
            //bounce.start();
            //console.log("tome");
            //game.world.setBounds(0,0,700,700);

            //game.world.setBounds(0,0,game.world.bounds.width-200,game.world.bounds.height-200);
            console.log("lixo");
        },this);

        game.camera.follow(player);


    }

    function updateMarker() {

        marker.x = game.math.snapToFloor(game.input.activePointer.worldX, tileSize);
        marker.y = game.math.snapToFloor(game.input.activePointer.worldY, tileSize);

    }

    function update() {

        //if(!game.input.activePointer.circle.contains(player.x,player.y)){
        if (game.input.mousePointer.isDown){
            player.rotation = game.physics.arcade.moveToXY(player, game.input.activePointer.worldX, game.input.activePointer.worldY, 30, 1000);

            target = new Phaser.Point(game.input.activePointer.worldX, game.input.activePointer.worldY);
        }else if(target){
            player.rotate = game.physics.arcade.moveToXY(player, target.x, target.y, 30, 1000);
        }

        if (cursors.left.isDown)
        {
            game.camera.x -= 4;
        }
        else if (cursors.right.isDown)
        {
            game.camera.x += 4;
        }

        if (cursors.up.isDown)
        {
            game.camera.y -= 4;
        }
        else if (cursors.down.isDown)
        {
            game.camera.y += 4;
        }


        //move_camera_by_pointer(game.input.mousePointer);

    }

    function render(){
        //game.debug.cameraInfo(game.camera, 48, 48);
        game.debug.spriteInfo(player, 16, 16);
        //game.debug.body(player);
    }

    function move_camera_by_pointer(o_pointer) {
        if (!o_pointer.timeDown) { return; }
        if (o_pointer.isDown && !o_pointer.targetObject) {
            if (o_mcamera) {
                game.camera.x += o_mcamera.x - o_pointer.position.x;
                game.camera.y += o_mcamera.y - o_pointer.position.y;
            }
            o_mcamera = o_pointer.position.clone();
        }
        if (o_pointer.isUp) { o_mcamera = null; }
    }

});