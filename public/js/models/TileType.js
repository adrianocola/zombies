var TileTypeModel = Backbone.Model.extend({

    initialize: function(){

    },

    tileImgPath: function(){
        return "/tiles/" + this.get('name') + ".png";
    }

});

var TileTypesCollection = Backbone.Collection.extend({
    model: TileTypeModel,

    url: '/api/editor/tiletypes/',

    initialize: function(){

    }

});