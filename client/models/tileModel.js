var AmpersandModel = require('ampersand-model');
var SlotCollection = require('./slotCollection.js');


module.exports = AmpersandModel.extend({
    idAttribute: '_id',
    props: {
        _id: {type: 'string', required: true},
        x: {type: 'number', required: true},
        y: {type: 'number', required: true},
        //slots: {type: 'object', required: true},
        type: {type: 'number', required: true},
        face: {type: 'number'}
    },
    collections: {
        slots: SlotCollection
    },
    derived: {
        pos: {
            deps: ['x', 'y'],
            fn: function () {
                return this.x + ':' + this.y;
            }
        }
    }
});