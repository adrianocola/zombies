var AmpersandModel = require('ampersand-model');


module.exports = AmpersandModel.extend({
    props:{
        id: {type: 'number'},
        name: {type: 'string'},
        width: {type: 'number'},
        height: {type: 'number'}
    }
});