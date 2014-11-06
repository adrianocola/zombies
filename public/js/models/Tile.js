var Tile = Backbone.Model.extend({

    idAttribute: '_id',
    urlRoot: function(){
        return '/api/tiles/';
    },

    initialize: function(){


    }


});

Tile.width = 48;
Tile.height = 48;
Tile.slots = 9; //tem que ser um número com raiz quadrada inteira
Tile.rows = Math.sqrt(Tile.size);
Tile.columns = Tile.rows;
Tile.slot_width = 16;
Tile.slot_height = 16;