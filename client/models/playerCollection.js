var AmpersandCollection = require('ampersand-rest-collection');
var Player = require('./playerModel');

module.exports = AmpersandCollection.extend({
    model: Player,
    url: '/api/player/'
});