
ZT.Tile = function(options){

    _.extend(this, Backbone.Events);

    this.options = _.extend({
        game: undefined, //game reference
        model: undefined, //tileModel
        x: 0, //tile absolute X position
        y: 0, //tile absolute Y position
        size: 48,//tile size in pixels
        mapX: 0,//X tile position in the map (in pixels)
        mayY: 0 //Y tile position in the map (in pixels)
    },options || {});

    this.id = this.genId();

    this.game = this.options.game;
    this.model = this.options.model;
    this.x = this.options.x; //tile position x
    this.y = this.options.y; //tile position y
    this.mapX = this.options.mapX; //tile x position relative to map (in pixels)
    this.mapY = this.options.mapY; //tile y position relative to map (in pixels)

    this.things = [];

};

ZT.Tile.prototype.genId = function(){
    ZT.Tile.prototype.unique_id_gen = ZT.Tile.prototype.unique_id_gen || 0;
    ZT.Tile.prototype.unique_id_gen++;
    return ZT.Tile.prototype.unique_id_gen;
};

ZT.Tile.prototype.addThing = function(thing,pos){
    this.things[pos] = thing;
};

ZT.Tile.prototype.removeThing = function(pos){
    this.things[pos] = undefined;;
};

ZT.Tile.prototype.draw = function(){

    var tileType = this.game.tileTypes.get(this.model.get('type'));
    var tileTypeName = tileType.get("name");

    if(tileType.get("shadow")){
        this.shadow = this.game.phaser.make.sprite(this.mapX-2, this.mapY-2, tileTypeName);
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 1;
        this.game.shadowLayer.add(this.shadow);
    }
    this.sprite = this.game.phaser.make.sprite(this.mapX, this.mapY,tileTypeName);

    if(tileType.get("body")){
        var that = this;
        this.game.phaser.physics.arcade.enable(this.sprite,Phaser.Physics.ARCADE);
        //
        this.game.constructionLayer.add(this.sprite);

        if(tileType.get("body")==="rigid"){
            this.sprite.body.immovable = true;
        }else if(tileType.get("body")!=="rigid"){
            //if you should move body to its original position after moving it
            this.sprite.update = function(){
                if(Math.abs(this.x - that.mapX) > 2 || Math.abs(this.y - that.mapY) > 2){
                    that.game.phaser.physics.arcade.moveToXY(this, that.mapX, that.mapY, 40);
                }else{
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                }
            }
        }

    }else{
        this.game.backgroundLayer.add(this.sprite);
    }

    if(this.options.size != tileType.get('width') || this.options.size != tileType.get('height')){
        if(this.shadow){
            this.shadow.scale.setTo(this.options.size/tileType.get('width'),this.options.size/tileType.get('height'));
        }
        this.sprite.scale.setTo(this.options.size/tileType.get('width'),this.options.size/tileType.get('height'));

    }

    //this.box = this.game.phaser.make.graphics();
    //this.box.lineStyle(1, 0x888888, 1);
    //this.box.alpha = 0.5;
    this.game.graphics.drawRect(this.mapX, this.mapY, this.options.size, this.options.size);
    //this.game.backgroundLayer.add(this.box);

    //this.text = this.game.phaser.make.text(this.mapX + 18, this.mapY + 19, this.x + ',' + this.y, {font: "7pt Arial", fill: "#aaaaaa"});
    //this.game.gridLayer.add(this.text);

};

ZT.Tile.prototype.destroy = function(){

    if(this.box) this.box.destroy(true);
    if(this.text) this.text.destroy(true);
    if(this.shadow) this.shadow.destroy(true);
    if(this.sprite) this.sprite.destroy(true);

    for(var i=0;i<this.things.length;i++){
        if(this.things[i]) this.things[i].destroy(true);
    }

};
