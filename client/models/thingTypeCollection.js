var AmpersandCollection = require('ampersand-rest-collection');
var ThingType = require('./thingTypeModel');

module.exports = AmpersandCollection.extend({
    model: ThingType,
    url: '/api/editor/thingtypes/'
});