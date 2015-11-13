
var EditorView = Backbone.View.extend({

    className: 'editor_view',

    initialize: function(options){
        var that = this;

        this.template = JST["public/partials/editor/editor.html"];

        this.tileTypes = new TileTypesCollection();

        this.tileTypes.fetch({success: function(col,resp){
            that.updateEditorTiles(col.toArray());
            that.initializeMap();
        }});

        this.currentTileType = undefined;

    },

    events: {
        'keyup .editor_filter': 'onFilter',
        'click .editor_clear': 'onClear',
        'change .editor_debug_pos': 'togglePositions',
        'change .editor_debug_grid': 'toggleGrid'
    },

    selectedTile: function(tileTypeModel){

        this.currentTileType = tileTypeModel;

        this.$('.editor_selected_id').val(tileTypeModel.id);
        this.$('.editor_selected_tile_img').attr('src',tileTypeModel.tileImgPath());
        this.$('.editor_selected_tile_name').val(tileTypeModel.get('name'));
    },

    onFilter: function(evt){
        var filter = $(evt.currentTarget).val();

        if(filter){
            var types = this.tileTypes.filter(function(type){ return type.get('name').indexOf(filter) != -1 });
        }else{
            var types = this.tileTypes.toArray();
        }

        this.$('.assets_tile').hide();

        for(var i=0;i<types.length;i++){
            types[i].trigger("show");
        }

    },

    onClear: function(){

        this.currentTileType = undefined;

        this.$('.editor_selected_id').val('');
        this.$('.editor_selected_tile_img').attr('src','');
        this.$('.editor_selected_tile_name').val('');
    },

    togglePositions: function(){
        this.editorMapView.togglePositions();
    },

    toggleGrid: function(){
        this.editorMapView.toggleGrid();
    },

    updateEditorTiles: function(tilesModels){

        var $tilesSection = this.$('.editor_tiles_section');

        $tilesSection.html('');

        for(var i=0; i< tilesModels.length; i++){
            $tilesSection.append(new EditorTileView({editor: this, model: tilesModels[i]}).render().el);
            //$tilesSection.append(this.templateTile({tile: tilesModels[i].toJSON()}));
        }

    },

    initializeMap: function(){

        this.editorMapView = new EditorMapView({editor: this, parent: $('.map'), tileTypes: this.tileTypes});
        $('.map').append(this.editorMapView.render().el);

    },

    render: function(){

        this.$el.html(this.template());

        return this;
    }

});


var EditorTileView = Backbone.View.extend({

    className: "assets_tile",

    initialize: function(options){
        var that = this;

        this.options = options || {};

        this.editor = this.options.editor;

        this.template = JST["public/partials/editor/tile.html"];

        this.listenTo(this.model,'hide',function(model){
            that.$el.hide();
        });

        this.listenTo(this.model,'show',function(model){
            that.$el.show();
        });

    },

    events:{
        'click': 'onSelection'
    },

    onSelection: function(evt){

        $('.assets_selected').removeClass('assets_selected');
        this.$el.addClass('assets_selected');

        this.editor.selectedTile(this.model);

    },

    render: function() {

        this.$el.html(this.template({tile: this.model.toJSON()}));

        return this;

    }
});


var EditorMapView = Backbone.View.extend({

    className: 'editor_map',

    initialize: function(options){

        var that = this;

        this.options = options || {};

        this.editor = this.options.editor;
        this.$parent = $(this.options.parent) || $('body');
        this.tileTypes = this.options.tileTypes;

        this.showPositions = this.options.showPositions;
        this.showGrid = this.options.showGrid;

        this.regionSize = 11;

        this.width = this.$parent.width();
        this.height = this.$parent.height();
        this.tileWidth = 48;
        this.tileHeight = 48;

        this.viewRegionsX = Math.floor(this.width/this.tileWidth/this.regionSize);
        this.viewRegionsY = Math.floor(this.height/this.tileHeight/this.regionSize);

        this.firstRegionX = 0;
        this.lastRegionX = Math.floor(this.width/this.tileWidth/this.regionSize + 1);
        this.firstRegionY = 0;
        this.lastRegionY = Math.floor(this.height/this.tileHeight/this.regionSize + 1);

        this.centerX = 0;
        this.centerY = 0;

        this.collection = new RegionCollection();

        this.listenTo(this.collection,'add',function(region){
            region.tiles.each(function(tile){
                that.addTile(tile);
            });
        });

        var regions = [];

        for(var x = this.firstRegionX; x < this.lastRegionX; x++){
            for(var y = this.firstRegionY; y < this.lastRegionY; y++){
                regions.push([x,y]);
            }
        }

        this.fetchRegions(regions);

    },

    events: {
        'mousedown': 'onMouseDown',
        'mouseup': 'onMouseUp',
        'contextmenu': 'onContextMenu'
    },

    onMouseDown: function(evt){
        if(evt.button===2){
            this.painting = true;
            this.paintTile(this.currentTileFocus);
        }
    },

    onMouseUp: function(evt){
        if(evt.button===2){
            this.painting = false;
        }
    },

    onContextMenu: function(evt){
        evt.preventDefault();
    },

    tileHover: function(tileModel){
        this.currentTileFocus = tileModel;
        this.paintTile(tileModel);
    },

    paintTile: function(tileModel){
        if(this.painting && this.editor.currentTileType){
            tileModel.set('type',this.editor.currentTileType.id);
            tileModel.save();
        }
    },

    togglePositions: function(){
        if(this.showPositions){
            this.$('.tile_position').hide();
        }else{
            this.$('.tile_position').show();
        }

        this.showPositions = !this.showPositions;
    },

    toggleGrid: function(){
        if(this.showGrid){
            this.$('.map_tile').removeClass('with_grid');
        }else{
            this.$('.map_tile').addClass('with_grid');
        }

        this.showGrid = !this.showGrid;
    },

    addTile: function(tileModel){

        var tileType = this.tileTypes.get(tileModel.get('type'));

        var editorTile = new EditorMapTileView({
            editorMap: this,
            model: tileModel
        });
        this.$el.append(editorTile.render().el);

        return editorTile;

    },

    fetchRegions: function(regions){

        this.collection.fetch({data: {points: JSON.stringify(regions)}, remove: false});

    },

    render: function(){
        var that = this;

        this.$el.pep({
            grid: [this.tileWidth,this.tileHeight],
            shouldEase: false,
            stop: function(){

                var regionTopLeftX = -this.cssX / that.tileWidth;
                var regionTopLeftY = -this.cssY / that.tileHeight;

                var regions = {};

                for(var x = regionTopLeftX - that.regionSize; x< regionTopLeftX + (that.viewRegionsX*that.regionSize) + that.regionSize; x++){
                    for(var y = regionTopLeftY - that.regionSize; y< regionTopLeftY + (that.viewRegionsY*that.regionSize + that.regionSize); y++){

                        var $tile = $('#' + x + 'x' + y + 'y');


                        if(!$tile.length){
                            //console.log('MISSING: #' + x + 'x' + y + 'y');
                            var rx = x>=0?Math.ceil(x/that.regionSize):Math.floor(x/that.regionSize);
                            var ry = x>=0?Math.ceil(y/that.regionSize):Math.floor(y/that.regionSize);
                            regions[rx + ':' + ry] = [rx,ry];
                        }else{
                            //console.log('FOUND: #' + x + 'x' + y + 'y');
                        }

                    }
                }
                that.fetchRegions(_.values(regions));

            }
        });

        return this;


    }

});


var EditorMapTileView = Backbone.View.extend({

    className: 'map_tile',

    initialize: function(options){

        this.options = options || {};

        this.editorMap = this.options.editorMap;
        this.x = this.model.get('pos')[0];
        this.y = this.model.get('pos')[1];

        this.template = JST["public/partials/editor/map_tile.html"];

        this.listenTo(this.model,'change',this.render);

    },

    events: {
        'click': 'onSelect',
        'mouseenter': 'onMouseEnter'
    },

    onSelect: function(){
        $('.selected').removeClass('selected');
        this.$el.addClass('selected');
    },

    onMouseEnter: function(){
        this.editorMap.tileHover(this.model);
    },

    render: function(){

        var tileType = this.editorMap.tileTypes.get(this.model.get('type'));

        this.$el.html(this.template({tile: this.model.toJSON(), tileType: tileType.toJSON()}));
        this.$el.attr('id', this.x + 'x' + this.y + 'y');

        this.$el.css({
            left: this.x*this.editorMap.tileWidth,
            top:  this.y*this.editorMap.tileHeight,
            width: this.editorMap.tileWidth,
            height: this.editorMap.tileHeight
        });

        if(!this.editorMap.showPositions){
            this.$('.tile_position').hide();
        }
        if(this.editorMap.showGrid){
            this.$el.addClass('with_grid');
        }

        return this;

    }

});


$(function(){

    var $editor = $('.editor');
    var editorView = new EditorView();
    $editor.append(editorView.render().el);

});
