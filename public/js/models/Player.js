
var PlayerModel = Backbone.Model.extend({

    idAttribute: '_id',
    urlRoot: "/api/player",

    defaults:{
        pos: [0,0],
        slot: 0
    },

    initialize: function(){

        this.on('change',this.updatePosition);
        this.updatePosition();

    },

    moveTo: function(x, y, slot){

        x = parseInt(x);
        y = parseInt(y);
        slot = parseInt(slot);

        var that = this;
        $.ajax(this.urlRoot + '/move',{type: "POST", data: {x: x, y: y, slot: slot || 0}, success: function(){
            that.set('pos',[x,y]);
            that.set('slot',slot);
        },error: function(){

        }});

    },

    updatePosition: function(){
        if(this.get('pos') && _.isArray(this.get('pos'))){
            this.x = parseInt(this.get('pos')[0]);
            this.y = parseInt(this.get('pos')[1]);
            this.slot = parseInt(this.get('slot'));
        }
    }

});

var PlayerCollection = Backbone.Collection.extend({
    model: PlayerModel,

    url: '/api/player/'
});
