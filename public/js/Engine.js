
(function($,Backbone,root){

    // Engine
    // -------------

    var Engine = root.Engine = Backbone.View.extend({

        className: 'engine',

        initialize: function(options){

            this.options = {
                visibleTiles: 9,        //number of tiles visible (must be an odd number)
                tileSize: 48,           //tile individual size
                tileSlots: 9,            //number of slots in each tile (sqrt must be an integer)
                speed: 1000
            }

            this.options = _.extend(this.options,options);

            this.consts = _.extend(this.options,{
                tileRadius: this.options.visibleTiles -1, //number of tiles from center to any border
                firstRow: -this.options.visibleTiles + 1,
                lastRow: this.options.visibleTiles - 1,
                totalRows: this.options.visibleTiles*2 -1,
                firstColumn: -this.options.visibleTiles + 1,
                lastColumn: this.options.visibleTiles - 1,
                totalColumns: this.options.visibleTiles*2 -1,
                engineOffX: ((this.options.visibleTiles*2 -1)*this.options.tileSize)/2 - this.options.tileSize/2,
                engineOffY: ((this.options.visibleTiles*2 -1)*this.options.tileSize)/2 - this.options.tileSize/2,
                slotSize: this.options.tileSize / Math.sqrt(this.options.tileSlots),
                slotRows: Math.sqrt(this.options.tileSlots),
                slotCols: Math.sqrt(this.options.tileSlots),
                totalTileSlots: [],
                border: this.options.visibleTiles*this.options.tileSize/2 - this.options.tileSize/2,
                visibleSize: this.options.visibleTiles*this.options.tileSize
            });

            console.log(this.consts.engineOffX);
            console.log(this.consts.engineOffY);

            for(var i = 0; i < this.options.tileSlots; i++){
                this.consts.totalTileSlots.push(i+"");
            }

        },

        createTile: function(row,col,options){

            var that = this;

            options = _.extend({engine: this},options);

            options.row = row;
            options.col = col;

            var tile = new Engine.Tile(options);

            this.listenTo(tile,'selected',function(){
                that.trigger('tile_selected',tile);
            });

            return tile;

        },

        _add: function(rows, cols, tile_options){

            var that = this;

            var rows_side = Util.rowSide(rows);
            var row_qtd = Math.abs(rows);

            var cols_side = Util.colSide(cols);
            var col_qtd = Math.abs(cols);


            if(row_qtd > this.consts.tileRadius || col_qtd > this.consts.tileRadius){
                throw "Can't add more than " + this.consts.tileRadius + " rows or columns (adding: " + row_qtd + "," + col_qtd + ")";
            }

            for(var c = this.consts.firstColumn; c <= this.consts.lastColumn; c++){
                for(var r = 1; r <= row_qtd; r++){
                    var tileView;
                    if(Util.isTop(rows_side)){
                        tileView =  this.createTile(this.consts.firstRow-r, c, tile_options);
                    }else{
                        tileView = this.createTile(this.consts.lastRow+r, c, tile_options);
                    }
                    this.$map.append(tileView.render().el);
                }

            }

            for(var r = this.consts.firstRow+rows; r <= this.consts.lastRow+rows; r++){
                for(var c = 1; c <= col_qtd; c++){
                    var tileView;
                    if(Util.isLeft(cols_side)){
                        tileView = this.createTile(r, this.consts.firstColumn-c, tile_options);
                    }else{
                        tileView = this.createTile(r, this.consts.lastColumn+c, tile_options);
                    }
                    this.$map.append(tileView.render().el);
                }

            }

            Util.runForEach(this.$map,'.tile','moveRel',[-rows,-cols]);

            setTimeout(function(){
                that._removeExtraRows(row_qtd, Util.otherSide(rows_side));
                that._removeExtraCols(col_qtd, Util.otherSide(cols_side));
            },this.options.speed * _.max([row_qtd,col_qtd]));

        },

        _removeExtraRows: function(quantity, side){

            for(var r = 1; r <= quantity; r++){

                if(Util.isTop(side)){
                    Util.runForEach(this.$map,'.' + (this.consts.firstRow-r) + 'r','remove');
                }else{
                    Util.runForEach(this.$map,'.' + (this.consts.lastRow+r) + 'r','remove');
                }
            }

        },

        _removeExtraCols: function(quantity, side){

            for(var r = 1; r <= quantity; r++){

                if(Util.isLeft(side)){
                    Util.runForEach(this.$map,'.' + (this.consts.firstColumn-r) + 'c','remove');
                }else{
                    Util.runForEach(this.$map,'.' + (this.consts.lastColumn+r) + 'c','remove');
                }
            }

        },

        _getTileFromRowCol: function(row, col){

            return this.$('.' + row + 'r.' + col + 'c').data('view');

        },

        addThing: function(thing, row, col){

            var tile = this._getTileFromRowCol(row,col);
            tile.addThing(thing);

        },

        moveThingTo: function(thing, row, col){

            var old_tile = thing.tile;
            var new_tile = this._getTileFromRowCol(row,col);

            new_tile.addThing(thing);

            //thing.$el.velocity({
            //    top: '+=' + (this.options.tileSize*row) + 'px',
            //    left: '+=' + (this.options.tileSize*col) + 'px'
            //},this.options.speed * _.max([Math.abs(row),Math.abs(col)]),function(){
            //    new_tile.addThing(thing);
            //});

        },

        centerMoveRelative: function(rows,cols){

            this._add(-rows,-cols,{is_new:true});

            this.$map.velocity({
                top: '+=' + (rows*this.options.tileSize) + "px",
                left: '+=' + (cols*this.options.tileSize) + "px"
            },this.options.speed * _.max([Math.abs(rows),Math.abs(cols)]));

        },

        render: function(){
            var that = this;

            this.$el.html('<div class="viewport"><div class="map"></div></div>');
            this.$viewport = this.$('.viewport');


            this.$map = this.$('.map');

            for(var r = this.consts.firstRow; r <= this.consts.lastRow; r++){
                for(var c = this.consts.firstColumn; c <= this.consts.lastColumn; c++){
                    var tile = this.createTile(r,c);
                    this.$map.append(tile.render().el);
                }
            }

            this.$viewport.pep({
                //constrainTo: 'parent',
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
                        that.$viewport.animate({transform: 'matrix(1, 0, 0, 1, ' + this.cssX + ', ' + this.cssY + ')'});
                    }
                }
            });

            this.$el.css({
                width: this.consts.visibleSize + "px",
                height: this.consts.visibleSize + "px"
            });
            this.$map.css({
                //top: this.consts.border + "px",
                //left: this.consts.border + "px",
                width: (this.consts.totalColumns*this.options.tileSize) + "px",
                height: (this.consts.totalRows*this.options.tileSize) + "px"
            });
            this.$viewport.css({
                top: -this.consts.border + "px",
                left: -this.consts.border + "px",
                width: (this.consts.totalColumns*this.options.tileSize) + "px",
                height: (this.consts.totalRows*this.options.tileSize) + "px"
            });

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

            this.things = {};

            this.row = this.options.row;
            this.col = this.options.col;

            this.$el.data('view',this);

        },

        events: {
            'click': 'onClick'
        },

        _absolutePosition: function(){

            return Point(this.col*this.engine.options.tileSize,this.row*this.engine.options.tileSize);

        },

        _absoluteSlotPosition: function(slot){

            var tileAbsPos = this._absolutePosition();
            var slotPoint = this._slotPoint(slot);

            return Point(tileAbsPos.x + slotPoint.x*this.engine.consts.slotSize,tileAbsPos.y + slotPoint.y*this.engine.consts.slotSize);

        },

        _slotPoint: function(slot){
            var x = (slot%(this.engine.consts.slotRows));
            var y = Math.floor(slot/(this.engine.consts.slotCols));
            return Point(x,y);
        },

        onClick: function(){
            $('.tile.selected').removeClass('selected');
            this.$el.addClass('selected');

            this.trigger('selected');
        },

        canAddThing: function(){

            return _.size(this.things)<9;

        },

        addThing: function(thing){

            if(!this.canAddThing()){
                throw "Can' add thing to Tile! Tile is full!";
            }

            var that = this;

            var length = _.size(this.things);

            var slotPoint = Point(Math.floor(this.engine.consts.slotRows/2),Math.floor(this.engine.consts.slotRows/2));

            var first_pos = slotPoint.x*this.engine.consts.slotRows + slotPoint.y;

            var slot = 0;

            //if first, add to center
            if(!length){
                slot = first_pos;
            }else{
                // ** random positioning **
                //var pos = _.sample(_.difference(this.engine.consts.totalTileSlots, _.keys(this.things)));
                //x = (pos%(this.engine.consts.slotRows));
                //y = Math.floor(pos/(this.engine.consts.slotCols));
                //this.things[pos] = thing;

                // ** static positioning **
                if(length<=first_pos){
                    length--;
                    if(length<0) length = 0;
                }
                slotPoint = this._slotPoint(length);
                slot = length;
            }

            this.things[slot] = thing;

            //thing already in a tile
            if(thing.tile){

                thing.tile.removeThing(thing);

                var tileAbsPos = this._absoluteSlotPosition(slot);
                var currentThingPos = thing.currentPosition();

                thing.$el.velocity("stop");

                thing.$el.velocity({
                    left: "+=" + (this.engine.options.engineOffX + tileAbsPos.x - currentThingPos.x) + "px",
                    top: "+=" + (this.engine.options.engineOffY + tileAbsPos.y - currentThingPos.y) + "px"
                },3000);


            }else{
                var tileAbsPos = this._absoluteSlotPosition(slot);

                this.engine.$map.append(thing.render().el);
                //TODO fazer thing se desenhar no render
                thing.$el.css({
                    left: (this.engine.options.engineOffX + tileAbsPos.x) + "px",
                    top: (this.engine.options.engineOffY + tileAbsPos.y) + "px"
                });
            }

            thing.engine = this.engine;
            thing.tile = this;
            thing.slot = slot;

        },

        removeThing: function(thing){

            if(thing && thing.slot!=null){
                delete this.things[thing.slot];
            }

        },

        moveRel: function(rows,columns, duration){

            var from_r = this.row;
            var from_c = this.col;

            this.row = from_r + rows;
            this.col = from_c + columns;

            this.$el.removeClass(from_r + 'r ' + from_c + 'c');
            this.$el.addClass(this.row + 'r ' + this.col + 'c');

            this.updtateName();

        },

        updtateName: function(){

            var $e = this.$('.tile_position');
            if(!$e.length){
                $e = $('<div class="tile_position">');
                this.$el.append($e);
            }
            $e.html(this.row + ',' + this.col);

        },

        remove: function(){
            this.$el.addClass('old');
        },

        render: function(){

            this.$el.addClass(this.row + 'r');
            this.$el.addClass(this.col + 'c');

            if(this.options.is_new){
                this.$el.addClass('new');
            }


            this.$el.css({left: (this.engine.options.engineOffX + this.col*this.engine.options.tileSize) + "px", top: (this.engine.options.engineOffY + this.row*this.engine.options.tileSize) + "px"});
            this.$el.css({width: this.engine.options.tileSize + 'px ', height: this.engine.options.tileSize + 'px'});
            this.$el.css({'background-size': this.engine.options.tileSize + 'px ' + this.engine.options.tileSize + 'px'});

            this.updtateName();

            return this;

        }



    });

    // Engine.Thing
    // -------------

    var Thing = Engine.Thing = Backbone.View.extend({

        className: 'thing',

        initialize: function (options) {

            this.options = options || {};

            this.engine = this.options.engine;
            this.tile = this.options.tile;
            this.slot = this.options.slot;

            if(this.options.type){
                this.$el.addClass(this.options.type);
            }

        },

        currentPosition: function(){
            var pos = this.$el.position();
            return new Point(pos.left,pos.top);
        }

    });

    // Engine.Thing
    // -------------

    var Point = Engine.Point = function(x,y){
        return {
            x: x,
            y: y
        }
    };


    // Engine.Util
    // -------------

    var Util = Engine.Util = {
        runForEach: function(context, selector, method, args){
            setTimeout(function(){
                context.find(selector).each(function(){
                    var view = $(this).data('view');
                    view[method].apply(view,args);

                });
            });
        },
        isTop: function(row){
            return row <= Const.TOP;
        },

        isBottom: function(row){
            return row >= Const.BOT;
        },

        isLeft: function(col){
            return col <= Const.LEFT;
        },

        isRight: function(col){
            return col >= Const.RIGHT;
        },

        otherSide: function(side){
            return -side;
        },

        rowSide: function(rows){
            return Util.isTop(rows)?Const.TOP:Const.BOT;
        },

        colSide: function(cols){
            return Util.isLeft(cols)?Const.LEFT:Const.RIGHT;
        },

        timer: {},

        timerStart: function(t){
            Util.timer[t || '*'] = new Date().getTime();
        },

        timerEnd: function(t){
            console.log("(" +  ( t || '*' ) + ") elapsed: " + (new Date().getTime() - Util.timer[t || '*']));
        }

    }

    var Const = Engine.Const = {
        TOP: -1,
        BOT: 1,
        LEFT: -1,
        RIGHT:1
    }

})(jQuery,Backbone,window);

