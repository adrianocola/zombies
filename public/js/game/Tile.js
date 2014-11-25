
ZT.Tile = function(options){

    this.options = options || {};

    this.id = this.genId();

    this.game = this.options.game;
    this.tileModel = this.options.tileModel;
    this.sprite = this.options.sprite;
    this.shadow = this.options.shadow;
    this.x = this.options.x;
    this.y = this.options.y;
    this.realX = this.options.realX;
    this.realY = this.options.realY;
    this.width = this.options.width;
    this.height = this.options.height;
    this.worldX = this.options.worldX;
    this.worldY = this.options.worldY;

}

ZT.Tile.prototype.updatePosition = function(newXRel, newYRel){

    this.x = this.x-newXRel;
    this.y = this.y-newYRel;

}

ZT.Tile.prototype.genId = function(){
    ZT.Tile.prototype.unique_id_gen = ZT.Tile.prototype.unique_id_gen || 0;
    ZT.Tile.prototype.unique_id_gen++;
    return ZT.Tile.prototype.unique_id_gen;
}

ZT.Tile.prototype.draw = function(){

    var tileType = this.game.tileTypes.get(this.tileModel.get('type'));
    var tileTypeName = tileType.get("name");

    if(tileType.get("shadow")){
        this.shadow = this.game.phaser.make.sprite(this.worldX-2, this.worldY-2, tileTypeName);
        this.shadow.tint = 0x000000;
        this.shadow.alpha = 1;
        this.game.shadowLayer.add(this.shadow);
    }
    this.sprite = this.game.phaser.make.sprite(this.worldX, this.worldY,tileTypeName);

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
                if(Math.abs(this.x - that.worldX) > 2 || Math.abs(this.y - that.worldY) > 2){
                    that.game.phaser.physics.arcade.moveToXY(this, that.worldX, that.worldY, 40);
                }else{
                    this.body.velocity.x = 0;
                    this.body.velocity.y = 0;
                }
            }
        }

    }else{
        this.game.backgroundLayer.add(this.sprite);
    }

    if(this.width != tileType.get('width') || this.height != tileType.get('height')){
        if(this.shadow){
            this.shadow.scale.setTo(this.width/tileType.get('width'),this.height/tileType.get('height'));
        }
        this.sprite.scale.setTo(this.width/tileType.get('width'),this.height/tileType.get('height'));

    }

    //this.box = this.game.phaser.make.graphics();
    //this.box.lineStyle(1, 0x888888, 1);
    //this.box.alpha = 0.3;
    //this.box.drawRect(this.worldX, this.worldY, this.width, this.height);
    //this.game.backgroundLayer.add(this.box);

    //this.text = this.game.phaser.make.text(this.worldX + 8, this.worldY + 16, this.realX + ',' + this.realY, {font: "7pt Arial", fill: "#FFFFFF"});
    //this.game.hudLayer.add(this.text);

}

ZT.Tile.prototype.destroy = function(){

    if(this.box) this.box.destroy(true);
    if(this.text) this.text.destroy(true);

}
