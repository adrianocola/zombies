
ZT.Tile = function(options){

    this.options = options || {};

    this.id = this.genId();

    this.game = this.options.game;
    this.sprite = this.options.sprite;
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

    this.sprite = this.game.phaser.make.sprite(this.worldX, this.worldY,this.y===1000?"road":"grass2");
    this.game.backgroundLayer.add(this.sprite);


    //this.box = this.game.phaser.make.graphics();
    //this.box.lineStyle(1, 0x888888, 1);
    //this.box.alpha = 0.3;
    //this.box.drawRect(this.worldX, this.worldY, this.width, this.height);
    //this.game.backgroundLayer.add(this.box);

    //this.text = this.game.phaser.make.text(this.worldX + 8, this.worldY + 16, this.x + ',' + this.y, {font: "7pt Arial", fill: "#FFFFFF"});
    //this.game.backgroundLayer.add(this.text);

}

ZT.Tile.prototype.destroy = function(){

    if(this.box) this.box.destroy(true);
    if(this.text) this.text.destroy(true);

}
