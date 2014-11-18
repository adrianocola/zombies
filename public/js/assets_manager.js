
$(function(){

    var assetsManagerView = new AssetsManagerView();
    $('.container').append(assetsManagerView.render().el);

});


var AssetsManagerView = Backbone.View.extend({

    className: 'assets_manager',

    initialize: function(options){
        var that = this;

        this.template = JST["public/partials/editor/assets.html"];
        this.templateTile = JST["public/partials/editor/tile.html"];

        this.tileTypes = new TileTypesCollection();

        this.listenTo(this.tileTypes,'add',function(model){
            that.addEditorTile(model);
        });

        this.tileTypes.fetch({silent: true, success: function(col,resp){
            that.updateEditorTiles(col.toArray());
        }});

    },

    events: {
        'keyup #assets_filter': 'onFilter',
        'click .assets_clear': 'onClear',
        'click .assets_save': 'onSave'
    },

    selectedTile: function(tileModel){

        this.$('#assets_selected_id').val(tileModel.get('_id'));
        this.$('#assets_selected_tile_img').attr('src',tileModel.tileImgPath());
        this.$('#assets_selected_tile_name').val(tileModel.get('name'));

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
        this.$('#assets_selected_id').val('');
        this.$('#assets_selected_tile_img').attr('src','');
        this.$('#assets_selected_tile_name').val('');
    },

    onSave: function(){

        var _id = this.$('#assets_selected_id').val();
        var name = this.$('#assets_selected_tile_name').val();
        var newimg = this.$('#assets_selected_tile_img').attr('data-newimg');

        //if doesnt have name, dont't save
        if(!name) return;

        if(!_id || newimg){
            this.uploader.setData({name: name, _id: _id});
            this.uploader.submit();
        }else{
            var tileModel = this.tileTypes.get(_id);
            tileModel.save({
                name: name
            },{wait: true, success: function(model){
                console.log(model);
            }});
        }


    },

    addEditorTile: function(editorTileModel){
        var $tilesSection = this.$('.assets_tiles_section');
        $tilesSection.append(new AssetsTileView({assetsManager: this, model: editorTileModel}).render().el);
    },

    updateEditorTiles: function(tilesModels){

        var $tilesSection = this.$('.assets_tiles_section');

        $tilesSection.html('');

        for(var i=0; i< tilesModels.length; i++){
            $tilesSection.append(new AssetsTileView({assetsManager: this, model: tilesModels[i]}).render().el);
        }

    },

    render: function(){

        var that = this;

        this.$el.html(this.template());

        this.uploader = new ss.SimpleUpload({
            button: this.$('#assets_selected_tile_img'), // HTML element used as upload button
            url: '/api/editor/upload', // URL of server-side upload handler
            name: 'tileupload', // Parameter name of the uploaded file
            multipart: true,
            responseType: 'json',
            autoSubmit: false,
            allowedExtensions: ['png'],
            onChange: function(file, ext, uploadBtn){

                var file = $('input[name="tileupload"]')[0].files[0];
                var $preview = that.$('#assets_selected_tile_img');

                var oFReader = new FileReader();
                oFReader.readAsDataURL(file);

                oFReader.onload = function (evt) {
                    $preview.attr('src', evt.target.result);
                    $preview.attr('data-newimg', true);
                };

            },
            onComplete: function(filename, response){
                that.tileTypes.add(response,{merge: true});
            }
        });


        return this;
    }

});

var AssetsTileView = Backbone.View.extend({

    className: "assets_tile",

    initialize: function(options){
        var that = this;

        this.options = options || {};

        this.assetsManager = this.options.assetsManager;

        this.template = JST["public/partials/editor/tile.html"];

        this.listenTo(this.model,'change',function(model){
            that.render();
        });

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

        this.assetsManager.selectedTile(this.model);

    },

    render: function() {

        this.$el.html(this.template({tile: this.model.toJSON()}));

        return this;

    }
});