var AmpersandModel = require('ampersand-model');
var TileCollection = require('./tileCollection.js');


module.exports = AmpersandModel.extend({
    idAttribute: '_id',
    urlRoot: "/api/player",
    props: {
        _id: {type: 'string', required: true},
        x: {type: 'number', required: true},
        y: {type: 'number', required: true},
        slot: {type: 'number',required: true}
    },
    derived: {
        pos: {
            deps: ['x', 'y'],
            fn: function () {
                return this.x + ':' + this.y;
            }
        }
    },
    moveTo: function(x, y, slot){

        x = parseInt(x);
        y = parseInt(y);
        slot = parseInt(slot);

        var that = this;
        $.ajax(this.urlRoot + '/move',{type: "POST", data: {x: x, y: y, slot: slot || 0}, success: function(){
            that.x = x;
            that.y = y;
            that.slot = slot;
        },error: function(){

        }});

    }
});