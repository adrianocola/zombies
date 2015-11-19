
var ThingModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(attributes){

        //easy shortcut to the thing's type
        this.type = ZT.thingTypes.get(attributes.type);

    },

    getThingId: function(){
        return TileModel.generateId(this.get("x"),this.get("y"),this.get("slot"));
    }

});

ThingModel.generateId = function(x,y,slot){
    return x + ':' + y + ':' + slot;
};

var ThingsCollection = Backbone.Collection.extend({
    model: ThingModel,

    initialize: function(){

    }

});
