var AmpersandCollection = require('ampersand-rest-collection');
var Region = require('./regionModel');

module.exports = AmpersandCollection.extend({
    model: Region,
    url: '/api/editor/regions',
    indexes: ['pos'],
    initialize: function(){

        this.on('add',this.onAdd);
        this.on('remove',this.onRemove);

    },

    onAdd: function(region){
        //socket.emit(ZT.shared.events.ENTER_REGION,region.getId());
    },

    onRemove: function(region){
        //socket.emit(ZT.shared.events.LEAVE_REGION,region.getId());
    }

});