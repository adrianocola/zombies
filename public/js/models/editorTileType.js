var EditorTileTypeModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){

    },

    tileImgPath: function(){
        return "/tiles/" + this.get('name') + ".png";
    }

});

var EditorTileTypesCollection = Backbone.Collection.extend({
    model: EditorTileTypeModel,

    url: '/api/editor/tiletypes/',

    initialize: function(){

    }

});