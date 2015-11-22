
var ThingModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(attributes){

    }

});

var ThingsCollection = Backbone.Collection.extend({
    model: ThingModel,

    initialize: function(){

    }

});
