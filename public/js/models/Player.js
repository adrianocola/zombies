
var PlayerModel = Backbone.Model.extend({

    idAttribute: '_id',
    urlRoot: "/api/player",

    moveTo: function(x, y, slot){

        x = parseInt(x);
        y = parseInt(y);
        slot = parseInt(slot);

        var that = this;
        $.ajax(this.urlRoot + '/move',{type: "POST", data: {x: x, y: y, slot: slot || 0}, success: function(){
            that.set('x',x);
            that.set('y',y);
            that.set('slot',slot);
        },error: function(){

        }});

    }

});

var PlayerCollection = Backbone.Collection.extend({
    model: PlayerModel,

    url: '/api/player/'
});
