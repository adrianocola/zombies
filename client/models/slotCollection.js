var AmpersandCollection = require('ampersand-rest-collection');
var Slot = require('./slotModel');

module.exports = AmpersandCollection.extend({
    model: Slot
});