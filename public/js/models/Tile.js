
var TileModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){

    }

});

var TilesCollection = Backbone.Collection.extend({
    model: TileModel,

    url: '/api/editor/tiles/',

    initialize: function(){

    }

});
