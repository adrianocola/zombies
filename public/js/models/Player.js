/**
 * PlayerModeal always treats x and y like the real world x and y
 */
var PlayerModel = Backbone.Model.extend({

    idAttribute: '_id',
    urlRoot: "/api/player",

    initialize: function(){

        this.on('change',this.updateXY);

    },

    moveTo: function(x, y){

    },

    updateXY: function(){
        if(this.get('pos') && _.isArray(this.get('pos'))){
            this.x = this.get('pos')[0];
            this.y = this.get('pos')[1];
        }else{
            delete this.x;
            delete this.y;
        }
    }

});
