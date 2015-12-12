

ZT.Events = function(options){

    _.extend(this, Backbone.Events);

    this.options = _.extend({},options || {});

    this.game = this.options.game;

    this.events = {};

};

ZT.Events.prototype.handleEvents = function(){

    var that = this;

    socket.on(ZT.Events.PLAYER_MOVE,function(data){
        if(that.events[data.id]) return;
        if(that.game.playerModel.id === data.actor) return;

        var player = that.game.players[data.player];
        var tile = that.game.map.getTileByTileXY(data.to.pos[0],data.to.pos[1]);
        var pos = tile.getSlotAbsoluteXY(data.to.slot);
        player.moveToXY(pos[0],pos[1]);
    });

    socket.on(ZT.Events.PLAYER_JOIN,function(data){
        if(that.events[data.id]) return;
        if(that.game.playerModel.id === data.actor) return;

        var model = new PlayerModel(data.model);
        var player = new ZT.Thing({tile: this.game.map.getTileByTileXY(model.x,model.y), slot: model.slot, model: model, game: that.game, image:"walking", animation: 'walk'});
        that.game.playerLayer.add(player.sprite);
        that.game.players[model.id] = player;

    });

};