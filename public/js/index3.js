
//VOLTAR A USER PHASER!


$(function(){

    window.game = new ZT.Game({
        visibleTiles: ZT.shared.consts.visibleTiles,
        regionTiles: ZT.shared.consts.regionTiles,
        tileSize: ZT.shared.consts.tileSize,
        slotSize: ZT.shared.consts.slotSize
    });
    window.game.start();

});