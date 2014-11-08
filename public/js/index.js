

$(function(){

    //TODO BUGS
    //se mandar mover crescer mapa (com engine.centerMoveRelative(0,3);) e andar com player ele se perde (por causa do novo nome dos tiles)

    //TODO
    //ROTACIONAR THING PARA DIREÇÃO QUE ESTÁ SE MOVENDO
    //IMPLEMENTAR ANDAR EM UM PATH DE TILES
    //IMPLEMENTAR MOVER MAPA AO ANDAR COM PLAYER
    //COLOCAR TAMANHO DO THING DINAMICAMENTE (EStÁ NO CSS)

    var engine = window.engine = new Engine();
    $('body').append(engine.render().el);

    var player = new Engine.Thing({type: 'player'});
    engine.addThing(player,0,0);

    engine.on('tile_selected',function(tile){
        tile.addThing(player);
        //engine.addThing(player,tile.row,tile.col);
    });
    //
    var create = function(r,c){
        return function(){
            engine.addThing(new Engine.Thing({type: 'zombie'}),r,c);
        }
    }

    var range = 0;

    var x = 0;
    for(var r = -range; r<= range; r++){
        for(var c = -range; c<= range; c++){
            for(var i = 0; i < 2; i++){
                x++;
                //setTimeout(create(r,c),x*1)
            }
        }
    }


    //for(var i = 0; i < 2; i++){
    //    setTimeout(function(){
    //        engine.addThing(new Engine.Thing({type: 'zombie'}),1,0);
    //    },i*100)
    //}

    //setTimeout(function(){
    //    engine.moveThingTo(player,4,0);
    //},2000);
    //
    //setTimeout(function(){
    //    engine.addThing(new Engine.Thing({type: 'zombie'}),0,0);
    //},2000);


});