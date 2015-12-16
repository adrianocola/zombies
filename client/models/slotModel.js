var AmpersandModel = require('ampersand-model');


module.exports = AmpersandModel.extend({
    props: {
        floor: {type: 'array'},
        stand: {type: 'object'}
    }
});