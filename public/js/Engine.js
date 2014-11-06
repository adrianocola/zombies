
(function($,Backbone,root){

    // Engine
    // -------------

    var Engine = root.Engine = Backbone.View.extend({

        className: 'engine',

        initialize: function(options){

            this.options = {
                visibleTiles: 11,        //number of tiles visible (must be an odd number)
                tileSize: 48,           //tile individual size
                tileSlots: 9            //number of slots in each tile (sqrt must be an integer)
            }

            this.options = _.extend(this.options,options);


            this.consts = {
                firstRow: -this.options.visibleTiles + 1,
                lastRow: this.options.visibleTiles - 1,
                firstColumn: -this.options.visibleTiles + 1,
                lastColumn: this.options.visibleTiles - 1,
                slotSize: this.options.tileSize / Math.sqrt(this.options.tileSlots),
                border: this.options.visibleTiles*this.options.tileSize/2 - this.options.tileSize/2,
                visibleSize: this.options.visibleTiles*this.options.tileSize
            }

        },

        createTile: function(row,col,options){

            options = _.extend({engine: this},options);

            options.row = row;
            options.col = col;

            return new Engine.Tile(options);

        },

        render: function(){
            var that = this;

            this.$el.html('<div class="map"></div>');
            this.$map = this.$('.map');

            for(var r = this.consts.firstRow; r <= this.consts.lastRow; r++){
                for(var c = this.consts.firstColumn; c <= this.consts.lastColumn; c++){
                    var tile = this.createTile(r,c);
                    this.$map.append(tile.render().el);
                }
            }

            this.$map.pep({
                //constrainTo: 'parent'
                grid: [this.options.tileSize,this.options.tileSize],
                shouldEase: false,
                stop: function(){

                    var fix;

                    if(this.cssX<-that.consts.border){
                        this.cssX = -that.consts.border; fix = true;
                    }else if(this.cssX>that.consts.border){
                        this.cssX = that.consts.border; fix = true;
                    }

                    if(this.cssY<-that.consts.border){
                        this.cssY = -that.consts.border; fix = true;
                    }else if(this.cssY>that.consts.border){
                        this.cssY = that.consts.border; fix = true;
                    }

                    if(fix){
                        that.$map.animate({transform: 'matrix(1, 0, 0, 1, ' + this.cssX + ', ' + this.cssY + ')'});
                    }
                }
            });

            this.$el.css({width: this.consts.visibleSize + "px", height: this.consts.visibleSize + "px"});
            this.$map.css({top: this.consts.border + "px", left: this.consts.border + "px"});

            return this;
        }

    });


    // Engine.Tile
    // -------------

    var Tile = Engine.Tile = Backbone.View.extend({

        className: 'tile',

        initialize: function(options){



            this.options = options || {row: 0, col: 0};

            this.engine = this.options.engine;

            this.data = {
                row: this.options.row,
                col: this.options.col
            }

            this.$el.data('view',this);

        },

        render: function(){

            this.$el.addClass(this.data.row + 'r');
            this.$el.addClass(this.data.col + 'c');

            if(this.options.is_new){
                this.$el.addClass('new');
            }

            this.$el.css({top: (this.data.row*this.engine.options.tileSize) + "px", left: (this.data.col*this.engine.options.tileSize) + "px"});
            this.$el.css({width: this.engine.options.tileSize + 'px ', height: this.engine.options.tileSize + 'px'});
            this.$el.css({'background-size': this.engine.options.tileSize + 'px ' + this.engine.options.tileSize + 'px'});

            this.$el.append('<div class="tile_position">' + this.data.row + ',' + this.data.col + '</div>');

            return this;

        }



    });


})(jQuery,Backbone,window);

