

ZT.Events = function(options){

    _.extend(this, Backbone.Events);

    this.options = _.extend({},options || {});

    this.game = this.options.game;

    this.events = {};

};

ZT.Events.prototype.handleEvents = function(){

    var that = this;

    socket.on(ZT.shared.events.PLAYER_MOVE,function(event){
        Logger.debug("Handling event " + ZT.shared.events.PLAYER_MOVE + ": " + event.id);

        if(that.events[event.id]) return;
        if(that.game.playerModel.id === event.actor) return;

        that.events[event.id] = true;

        var fromRegionModel = that.game.map.getRegionByTileXY(event.data.from.x,event.data.from.y);
        var toRegionModel = that.game.map.getRegionByTileXY(event.data.to.x,event.data.to.y);

        //if moved in from uncached region, add player
        if(!fromRegionModel){
            Logger.debug(ZT.shared.events.PLAYER_MOVE + ": player moved in from uncached region");
            var model = new PlayerModel(event.data.player);
            var player = new ZT.Thing({tile: that.game.map.getTileByTileXY(model.get("x"),model.get("y")), slot: model.slot, model: model, game: that.game, image:"walking", animation: 'walk'});
            that.game.playerLayer.add(player.sprite);
            that.game.players[model.id] = player;
        //if moved out from cached region, remove player
        }else if(!toRegionModel){
            Logger.debug(ZT.shared.events.PLAYER_MOVE + ": player moved from cached region");
            var player = that.game.players[event.data.player._id];
            delete that.game.players[player.model.id];
            player.destroy();
        //if have from and to, just move player
        }else{
            Logger.debug(ZT.shared.events.PLAYER_MOVE + ": player moved between cached regions");
            var player = that.game.players[event.data.player._id];
            var tile = that.game.map.getTileByTileXY(event.data.to.x,event.data.to.y);
            var pos = tile.getSlotAbsoluteXY(event.data.to.slot);
            player.moveToXY(pos[0],pos[1]);
        }

    });

    socket.on(ZT.shared.events.PLAYER_JOIN,function(event){
        if(that.events[event.id]) return;
        if(that.game.playerModel.id === event.actor) return;

        var model = new PlayerModel(event.data.player);
        var player = new ZT.Thing({tile: that.game.map.getTileByTileXY(model.get("x"),model.get("y")), slot: model.slot, model: model, game: that.game, image:"walking", animation: 'walk'});
        that.game.playerLayer.add(player.sprite);
        that.game.players[model.id] = player;

    });

};