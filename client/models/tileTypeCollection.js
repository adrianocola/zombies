var AmpersandCollection = require('ampersand-rest-collection');
var TileType = require('./tileTypeModel');

module.exports = AmpersandCollection.extend({
    model: TileType,
    url: '/api/editor/tiletypes/'
});