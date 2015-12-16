var AmpersandModel = require('ampersand-model');


module.exports = AmpersandModel.extend({
    props: {
        id: {type: 'number'},
        name: {type: 'string'},
        body: {type: 'string'},
        shadow: {type: 'boolean'},
        width: {type: 'number'},
        height: {type: 'number'}
    },
    tileImgPath: function(){
        return "/tiles/" + this.name + ".png";
    }
});