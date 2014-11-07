

$(function(){

    //var mapView = window.mapView = new MapView();

    //$('#view').append(mapView.render().el);

    //USAR TRANSFORMADAS CSS AO INVÉS DE TOP E LEFT?!

    //engine.centerMoveRelative(2,2); está bugando o movimento

    //FAZER SPEED SER NO VALOR px/s
    //IMPLEMENTAR ANDAR EM UM PATH DE TILES
    //IMPLEMENTAR MOVER MAPA AO ANDAR COM PLAYER
    //ROTACIONAR THING PARA DIREÇÃO QUE ESTÁ SE MOVENDO

    var engine = window.engine = new Engine();
    $('body').append(engine.render().el);

    var player = new Engine.Thing({type: 'player'});
    engine.addThing(player,0,0);

    engine.on('tile_selected',function(tile){
        tile.addThing(player);
        //engine.addThing(player,tile.row,tile.col);
    });
    //
    for(var i = 0; i < 2; i++){
        setTimeout(function(){
            engine.addThing(new Engine.Thing({type: 'zombie'}),1,0);
        },i*100)

    }

    //setTimeout(function(){
    //    engine.moveThingTo(player,4,0);
    //},2000);
    //
    //setTimeout(function(){
    //    engine.addThing(new Engine.Thing({type: 'zombie'}),0,0);
    //},2000);


});