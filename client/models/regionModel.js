var AmpersandModel = require('ampersand-model');
var TileCollection = require('./tileCollection.js');


module.exports = AmpersandModel.extend({
    idAttribute: '_id',
    props: {
        _id: {type: 'string', required: true},
        x: {type: 'number', required: true},
        y: {type: 'number', required: true}
    },
    collections: {
        tiles: TileCollection
    },
    derived: {
        pos: {
            deps: ['x', 'y'],
            fn: function () {
                return this.x + ':' + this.y;
            }
        }
    },
    initialize: function(){
        //console.log(this.tiles);
    }
});

module.exports.generateId = function(x,y){
    return x + ':' + y;
};
