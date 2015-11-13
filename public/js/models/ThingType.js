var ThingTypeModel = Backbone.Model.extend({

    initialize: function(){

    }

});

var ThingTypesCollection = Backbone.Collection.extend({
    model: ThingTypeModel,

    url: '/api/editor/thingtypes/',

    initialize: function(){

    }

});