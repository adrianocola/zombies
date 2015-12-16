var AmpersandModel = require('ampersand-model');


module.exports = AmpersandModel.extend({
    idAttribute: '_id',
    props: {
        _id: {type: 'string'},
        type: {type: 'number'},
        name: {type: 'string'},
        entity: {type: 'string'}
    }
});