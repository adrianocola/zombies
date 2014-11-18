
var EditorTileModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){

    }

});

var EditorTilesCollection = Backbone.Collection.extend({
    model: EditorTileModel,

    url: '/api/editor/tiles/',

    initialize: function(){

    }

});
