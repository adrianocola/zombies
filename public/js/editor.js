
var TileModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){

    }


});

var TilesCollection = Backbone.Collection.extend({
    model: TileModel,

    url: '/api/editor/tiles/',

    initialize: function(){

    }

});



var EditorMap = Backbone.View.extend({

    className: 'editor_map',

    initialize: function(options){

        var that = this;

        this.options = options || {};

        this.$parent = $(this.options.parent) || $('body');

        this.width = this.$parent.width();
        this.height = this.$parent.height();
        this.tileWidth = 48;
        this.tileHeight = 48;

        this.viewTilesX = Math.floor(this.width/this.tileWidth);
        this.viewTilesY = Math.floor(this.height/this.tileHeight);

        this.firstTileX = 0;
        this.lastTileX = Math.floor(this.width/this.tileWidth);
        this.firstTileY = 0;
        this.lastTileY = Math.floor(this.height/this.tileHeight)


        this.tilesCollection = new TilesCollection();

        this.listenTo(this.tilesCollection,'add',function(tile){
            that.addTile(tile);
        });

        var tiles = [];

        for(var x = this.firstTileX; x < this.lastTileX; x++){
            for(var y = this.firstTileY; y < this.lastTileY; y++){
                tiles.push([x,y]);
            }
        }

        this.fetchTiles(tiles);

    },

    addTile: function(tile){

        var editorTile = new EditorTile({
            editor: this,
            model: tile
        });
        this.$el.append(editorTile.render().el);

        return editorTile;

    },

    fetchTiles: function(tiles){

        this.tilesCollection.fetch({data: {tiles: JSON.stringify(tiles)}, remove: false});

    },

    render: function(){
        var that = this;

        this.$el.pep({
            grid: [this.tileWidth,this.tileHeight],
            shouldEase: false,
            stop: function(){

                var tileTopLeftX = -this.cssX / that.tileWidth;
                var tileTopLeftY = -this.cssY / that.tileHeight;

                var tiles = [];

                for(var x = tileTopLeftX; x< tileTopLeftX + that.viewTilesX; x++){
                    for(var y = tileTopLeftY; y< tileTopLeftY + that.viewTilesY; y++){

                        var $tile = $('#' + x + 'x' + y + 'y');

                        if(!$tile.length){
                            tiles.push([x,y]);
                        }

                    }
                }

                that.fetchTiles(tiles);

            }
        });

        return this;


    }

});


var EditorTile = Backbone.View.extend({

    className: 'tile',

    initialize: function(options){

        this.options = options || {};

        this.editor = this.options.editor;
        this.x = this.model.get('pos')[0];
        this.y = this.model.get('pos')[1];

    },

    events: {
        'click': 'onSelect',
        'contextmenu': 'onContextMenu'
    },

    onSelect: function(){
        $('.selected').removeClass('selected');
        this.$el.addClass('selected');
    },

    onContextMenu: function(evt){
        evt.preventDefault();
    },

    render: function(){

        this.$el.attr('id', this.x + 'x' + this.y + 'y');

        this.$el.css({
            left: this.x*this.editor.tileWidth,
            top:  this.y*this.editor.tileHeight,
            width: this.editor.tileWidth,
            height: this.editor.tileHeight
        });

        this.$img = $('<img class="tile_img">');
        this.$img.attr('src','/img/' + tileTypesMap[this.model.get('type')].name + '.png');
        this.$el.append(this.$img);

        this.$el.append('<div class="tile_position">' + this.x + ',' + this.y + '</div>');

        return this;


    }

});


$(function(){

    var $map = $('.map');

    var editorMap = new EditorMap({parent: $map});
    $map.append(editorMap.render().el);

});