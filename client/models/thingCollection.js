var AmpersandCollection = require('ampersand-rest-collection');
var Thing = require('./thingModel');

module.exports = AmpersandCollection.extend({
    model: Thing
});