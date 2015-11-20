
var ThingModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(attributes){

        //easy shortcut to the thing's type
        this.type = ZT.thingTypes.get(attributes.type);

    }

});

var ThingsCollection = Backbone.Collection.extend({
    model: ThingModel,

    initialize: function(){

    }

});
