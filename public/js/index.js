

$(function(){

    //var mapView = window.mapView = new MapView();

    //$('#view').append(mapView.render().el);

    var engine = new Engine();
    $('body').append(engine.render().el);


});


var MapView = Backbone.View.extend({

    id: "map",

    initialize: function(options){

        this.template = JST['public/partials/map.html'];



    },

    createTile: function(row,column,options){

        options = options || {};

        options.r = row;
        options.c = column;

        return new TileView({model: new Tile(options)});

    },

    isTop: function(row){
        return row >= _TOP;
    },

    isBottom: function(row){
        return row <= _BOT;
    },

    isLeft: function(col){
        return col <= _LEFT;
    },

    isRight: function(col){
        return col >= _RIGHT;
    },

    forEachRowInBorders: function(rows ,fn){

        var first,last,mod;

        if(rows>0){
            first = World.lastRow;
            last = World.lastRow-rows;
            mod = -1;
        }else{
            first = World.firstRow;
            last = World.firstRow-rows;
            mod = 1;
        }

        var count = 0;
        for(var i = first; i != last; i += mod ){
            fn(i,++count,-mod);
        }

    },

    addNewTilesToColumn: function(qtd,column,options){

        var that = this;

        this.forEachRowInBorders(qtd,function(i,c,o){
            var tileView;
            if(o>0){
                tileView = that.createTile(World.lastRow+c, column, options);
            }else{
                tileView = that.createTile(World.firstRow-c, column, options);
            }

            that.$el.append(tileView.render().el);
        });

        //for(var i = World.firstRow){
        //
        //}


        //this.forEachTileInColumn(column,function(tileView){
        //    tileView.moveRel(1,0);
        //});

    },

    forEachTileInColumn: function(column, fn){
        this.$('.' + column + 'c').each(function(){
            fn($(this).data('view'));
        });
    },

    getTileByRowCol: function(r,c){
        var $element = this.$('.' + r + 'r.' + c + 'c');
        if($element.length){
            return $element.data('view');
        }
    },

    centerMove: function(rows,columns){

        //if(rows || columns){
        //    $('.tile').animate({
        //        top: (rows>0?'-':'+') + '=' + Math.abs(rows*Tile.width) + 'px',
        //        left: (columns>0?'-':'+') + '=' + Math.abs(columns*Tile.width) + 'px'
        //    },1000);
        //}

        this.addNewTilesToColumn(rows,0);

        if(rows){

            var initialX = rows>0?World.firstRow:World.lastRow;
            var finalX = rows>0?World.firstRow-rows:World.lastRow+rows;

            for(var r = initialX; r != finalX; initialX>0?r--:r++){
                /*for(var c = World.firstColumn; c <= World.lastColumn; c++){
                    var tileView = this.createTile(r,c,{is_new: true});
                    tileView.$el.addClass('animated ' + (columns>0?'fadeInBottom':'fadeInTop'));
                    this.$el.append(tileView.render().el);
                };*/
                //this.$('.tile.' + r + 'r').each(function(){
                //    $(this).data('view').moveRel(1,0);
                //});

            }


            //var initialX = rows>0?World.firstRow:World.lastRow;
            //var finalX = rows>0?World.firstRow-rows:World.lastRow+rows;
            //for(var r = initialX; r != finalX; initialX>0?r--:r++){
            //    var row = this.tiles[r];
            //    for(var c = World.firstColumn; c <= World.lastColumn; c++){
            //        if(row[c]){
            //            row[c].remove();
            //            row[c] = this.createTile(r,-c,{is_new: true});
            //            row[c].$el.addClass('animated ' + (columns>0?'fadeInBottom':'fadeInTop'));
            //        }else{
            //            delete row[c];
            //        }
            //    }
            //}
        }


        if(columns){
            var initialY = columns>0?World.firstColumn:World.lastColumn;
            var finalY = columns>0?World.firstColumn-columns:World.lastColumn+columns;
            for(var r= World.firstRow; r <= World.lastRow; r++){
                for(var c = initialY; c != finalY; initialY>0?c--:c++){
                    if(this.tiles[r][c]){
                        this.tiles[r][c].remove();
                        this.tiles[r][c] = this.createTile(r,-c,{is_new: true});
                        this.tiles[r][c].$el.addClass('animated ' + (columns>0?'fadeInRight':'fadeInLeft'));
                    }else{
                        delete this.tiles[r][c];
                    }
                }

            }
        }

    },

    moveTile: function(tileView, to_row, to_col){

        var cur_r = tileView.model.get('r');
        var cur_c = tileView.model.get('c');


    },

    deleteRow: function(r){
        /*var row = this.tiles[r];
        for(var c = World.firstColumn; c < World.lastColumn; c++){
            if(row[c]) row[c].remove();
            delete row[c];
        }*/
        this.$('.tile.' + r + 'r').each(function(){
            $(this).data('view').remove();
        })
    },

    deleteColumn: function(c){
        //for(var r= World.firstRow; r < World.lastRow; r++){
        //    if(this.tiles[r][c]) this.tiles[r][c].remove();
        //    delete this.tiles[r][c];
        //}
        this.$('.tile.' + c + 'c').each(function(){
            $(this).data('view').remove();
        })
    },

    render: function(){

        var that = this;

        this.$el.html(this.template());

        for(var r= World.firstRow; r <= World.lastRow; r++){
            for(var c=World.firstColumn; c <= World.lastColumn; c++){
                var tileView = this.createTile(r,c);
                this.$el.append(tileView.render().el);
            }
        }

        this.$el.pep({
            //constrainTo: 'parent'
            grid: [48,48],
            shouldEase: false,
            stop: function(){

                var fix;

                if(this.cssX<-240){
                    this.cssX = -240; fix = true;
                }else if(this.cssX>240){
                    this.cssX = 240; fix = true;
                }

                if(this.cssY<-240){
                    this.cssY = -240; fix = true;
                }else if(this.cssY>240){
                    this.cssY = 240; fix = true;
                }

                if(fix){
                    that.$el.animate({transform: 'matrix(1, 0, 0, 1, ' + this.cssX + ', ' + this.cssY + ')'});
                }
            }
        });

        this.$el.css({top: "240px", left: "240px"});

        return this;

    }
});

var TileView = Backbone.View.extend({

    className: "tile",

    initialize: function(options){

        this.template = JST['public/partials/tile.html'];

        this.things = {};

        this.$el.addClass(this.model.get('r') + 'r');
        this.$el.addClass(this.model.get('c') + 'c');

        if(this.model.get('is_new')){
            this.$el.addClass('new');
        }

        this.$el.data('view',this);

    },

    events: {
        'click': 'onClick'
    },

    onClick: function(){
        $('.tile.selected').removeClass('selected');
        this.$el.addClass('selected');
    },

    moveRel: function(rows,columns){

        var from_r = this.model.get('r');
        var from_c = this.model.get('c');

        var to_r = from_r + rows;
        var to_c = from_c + columns;

        this.$el.removeClass(from_r + 'r');
        this.$el.removeClass(from_c + 'c');

        this.$el.addClass(to_r + 'r');
        this.$el.addClass(to_c + 'c');

        this.model.set('r',to_r);
        this.model.set('c',to_c);

        this.$el.animate({top: (rows>0?'+':'-') + '=' + (rows*Tile.height) + "px", left: (columns>0?'+':'-') + '=' + (columns*Tile.width) + "px"});

    },

    canAddThing: function(){

        return _.size(this.things)<9;

    },

    addThing: function(thing){

        var free;
        for(var i = 0; i<Tile.slots; i++){
            if(!this.things[i]){
                free = i;
                break;
            }
        }

        if(!free) return null;

        var row = Math.floor(free/rows);
        var column = free%rows;

        this.things[free] = thing;


        return Point(row*Tile.slot_width,column*Tile.slot_height);

    },

    render: function(){

        this.$el.html(this.template({tile: this.model.toJSON()}));

        this.$el.css({top: (this.model.get('r')*Tile.height) + "px", left: (this.model.get('c')*Tile.width) + "px"});

        if(this.model.get('r')==2 && this.model.get('c') ==0){
            this.$el.append(new ThingView().render().el);
        }

        return this;

    }
});


var ThingView = Backbone.View.extend({

    className: "thing player",

    initialize: function(options){

        this.template = JST['public/partials/thing.html'];

    },

    render: function(){

        this.$el.html(this.template());

        return this;

    }
});
