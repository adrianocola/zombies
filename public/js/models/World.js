var World = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){


    }


});


World.visibleRows = 11; //precisa ser um número ímpar
World.visibleColumns = 11;
World.firstRow = -World.visibleRows + 1;
World.lastRow = World.visibleRows - 1;
World.firstColumn = -World.visibleColumns + 1;
World.lastColumn = World.visibleColumns - 1;
World.rows = (2*World.visibleRows)-1;
World.columns = (2*World.visibleColumns)-1;