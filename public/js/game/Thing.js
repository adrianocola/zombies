ZT.Thing = function (options) {

    var that = this;

    _.extend(this, Backbone.Events);

    this.options = _.extend({
        game: undefined, //game reference
        model: undefined, //thingModel
        image: 'walking',//sprite image to load
        shadow: false, //should generate shadow
        animation: undefined, //animation used when moving
        tile: undefined, //parent tile
        slot: 0,//tile slot position
        size: 16//slot size in pixels
    },options || {});

    this.game = this.options.game;
    this.model = this.options.model;
    this.tile = this.options.tile;
    this.slot = this.options.slot; //tile slot position
    
    this.mapX = this.tile.mapX + Math.floor(this.slot%3)*this.options.size + this.options.size/2;
    this.mapY = this.tile.mapY + Math.floor(this.slot/3)*this.options.size + this.options.size/2;

    var image = this.game.phaser.cache.getImage(this.options.image);
    var ratio = this.game.slotSize/image.height;

    if(this.options.shadow){
        this.shadow = this.game.phaser.add.sprite(this.mapX -1, this.mapY -1, this.options.image);
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 1;
        this.shadow.anchor.setTo(0.4, 0.4);
        this.shadow.scale.setTo(ratio, ratio);
        this.game.shadowLayer.add(this.shadow);
    }

    this.sprite = this.game.phaser.add.sprite(this.mapX,this.mapY, this.options.image);
    if(this.options.animation) this.animation = this.sprite.animations.add(this.options.animation);

    this.sprite.anchor.setTo(0.4, 0.4);
    this.sprite.scale.setTo(ratio, ratio);

    this.game.phaser.physics.arcade.enable(this.sprite,Phaser.Physics.ARCADE);
    this.sprite.body.allowRotation = false;

    this.game.thingLayer.add(this.sprite);

    this.sprite.update = function(){

        if(that.shadow){
            that.shadow.angle = that.sprite.angle;
            that.shadow.x = that.sprite.x -1;
            that.shadow.y = that.sprite.y -1 ;
        }

        if(that.target){

            var duration = Math.sqrt( Math.pow(that.sprite.x-that.target.x,2) + Math.pow(that.sprite.y-that.target.y,2))/48 * 1000;
            that.sprite.rotation = that.game.phaser.physics.arcade.moveToXY(that.sprite, that.target.x, that.target.y, 48, duration);

            if( Math.abs(that.target.x - that.sprite.x) <= 1 && Math.abs(that.target.y - that.sprite.y) <= 1){

                that.sprite.x = that.target.x;
                that.sprite.y = that.target.y;

                if(that.shadow){
                    that.shadow.x = that.sprite.x -1;
                    that.shadow.y = that.sprite.y -1 ;
                }

                delete that.target;
                that.sprite.body.velocity.x = 0;
                that.sprite.body.velocity.y = 0;
                if(that.animation) that.animation.stop();
            }
        //if nothing touching anything and far away from position, move to position
        }else if(that.options.goback && !that.goback){
            if(Math.abs(that.x - that.sprite.x) > 20 || Math.abs(that.y - that.sprite.y) > 20){
                var duration = Math.sqrt( Math.pow(that.sprite.x-that.x,2) + Math.pow(that.sprite.y-that.y,2))/96 * 1000;
                that.sprite.rotation = that.game.phaser.physics.arcade.moveToXY(that.sprite, that.x, that.y, 96, duration);
                that.sprite.body.velocity.x = 0;
                that.sprite.body.velocity.y = 0;
                that.sprite.body.enable = false;
                that.goback = that.game.phaser.add.tween(that.sprite).to( { x: that.x, y:that.y }, duration, Phaser.Easing.Linear.None, true);
                that.goback.onComplete.add(function () {
                    delete that.goback;
                    that.sprite.body.enable = true;
                }, this);
            }
        }

    }

};

ZT.Thing.prototype.moveToXY = function(x,y,speed){
    this.target = new Phaser.Point(x, y);
    var duration = Math.sqrt( Math.pow(this.mapX-x,2) + Math.pow(this.mapY-y,2))/(speed || 48) * 1000;
    this.sprite.rotation = this.game.phaser.physics.arcade.moveToXY(this.sprite, x, y, speed || 48, duration);
    if(this.animation) this.animation.play(7, true);
};

ZT.Thing.prototype.update = function() {



};
