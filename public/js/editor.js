
var TileModel = Backbone.Model.extend({

    idAttribute: '_id',

    initialize: function(){

    }


});

var TileTypeModel = Backbone.Model.extend({

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

var TileTypesCollection = Backbone.Collection.extend({
    model: TileTypeModel,

    url: '/api/editor/tiletypes/',

    initialize: function(){

    }

});


var EditorView = Backbone.View.extend({

    className: 'editor_view',

    initialize: function(options){
        var that = this;

        this.template = JST["public/partials/editor/editor.html"];
        this.templateTile = JST["public/partials/editor/editor_tile.html"];

        this.tileTypes = new TileTypesCollection();

        this.tileTypes.fetch({success: function(col,resp){
            that.updateEditorTiles(col.toArray());
            that.initilizeMap();
        }});

    },

    events: {
        'click .editor_selection_tile': 'onTileSelection',
        'keyup .editor_filter': 'onFilter',
        'click .editor_clear': 'onClear',
        'click .editor_save': 'onSave'
    },

    onTileSelection: function(evt){
        var $tile = $(evt.currentTarget);

        this.$('.editor_selected').removeClass('editor_selected');
        $tile.addClass('editor_selected');

        this.$('.editor_selected_id').val($tile.attr('data-id'));
        this.$('.editor_selected_tile_img').attr('src',$tile.find('.editor_selection_tile_img').attr('src'));
        this.$('.editor_selected_tile_name').val($tile.attr('title'));

    },

    onFilter: function(evt){
        var filter = $(evt.currentTarget).val();

        if(filter){
            var types = this.tileTypes.filter(function(type){ return type.get('name').indexOf(filter) != -1 });
        }else{
            var types = this.tileTypes.toArray();
        }

        this.updateEditorTiles(types);

    },

    onClear: function(){
        this.$('.editor_selected_id').val('');
        this.$('.editor_selected_tile_img').attr('src','');
        this.$('.editor_selected_tile_name').val('');
    },

    onSave: function(){

        //if doesnt have name, dont't save
        if(!this.$('.editor_selected_tile_name').val()) return;

        //if have id must change existing tile
        if(this.$('.editor_selected_id').val()){

        //must create a new tile
        }else{

        }
    },

    updateEditorTiles: function(tilesModels){

        var $tilesSection = this.$('.editor_tiles_section');

        $tilesSection.html('');

        for(var i=0; i< tilesModels.length; i++){
            $tilesSection.append(this.templateTile({tile: tilesModels[i].toJSON()}));
        }

    },

    initilizeMap: function(){

        this.editorMapView = new EditorMapView({parent: $('.map'), tileTypes: this.tileTypes});
        $('.map').append(this.editorMapView.render().el);

    },

    render: function(){

        var that = this;

        this.$el.html(this.template());

        this.uploader = new ss.SimpleUpload({
            button: this.$('.editor_selected_tile_img'), // HTML element used as upload button
            url: '/api/editor/upload', // URL of server-side upload handler
            name: 'tileupload', // Parameter name of the uploaded file
            multipart: true,
            responseType: 'json',
            autoSubmit: false,
            allowedExtensions: ['png'],
            onChange: function(file, ext, uploadBtn){

                var file = $('input[name="tileupload"]')[0].files[0];
                var $preview = that.$('.editor_selected_tile_img');

                var oFReader = new FileReader();
                oFReader.readAsDataURL(file);

                oFReader.onload = function (evt) {
                    $preview.attr('src', evt.target.result);
                };

            },
            onSubmit: function(){
                this.setData({})
            }
        });


        return this;
    }

});


var EditorMapView = Backbone.View.extend({

    className: 'editor_map',

    initialize: function(options){

        var that = this;

        this.options = options || {};

        this.$parent = $(this.options.parent) || $('body');
        this.tileTypes = this.options.tileTypes;

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

        var tileType = this.tileTypes.findWhere({_id: tile.get('type')});

        var editorTile = new EditorTile({
            editor: this,
            model: tile,
            tileType: tileType
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
        this.tileType = this.options.tileType;
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

        var that = this;

        this.$el.attr('id', this.x + 'x' + this.y + 'y');

        this.$el.css({
            left: this.x*this.editor.tileWidth,
            top:  this.y*this.editor.tileHeight,
            width: this.editor.tileWidth,
            height: this.editor.tileHeight
        });

        this.$img = $('<img class="tile_img">');
        this.$img.attr('src','/img/tiles/' + this.tileType.get('name') + '.png');
        this.$el.append(this.$img);

        this.$el.append('<div class="tile_position">' + this.x + ',' + this.y + '</div>');

        return this;


    }

});


$(function(){

    var $editor = $('.editor');
    var editorView = new EditorView();
    $editor.append(editorView.render().el);

});
