/**
 * @description A color picker plugin. 
 *
 * @name colorPicker
 * @version 1.0
 * @author mbaijs
 */
define(
[],
function()
{
    var pluginName = "colorPicker"
    ,   defaults   = 
        {
            backgroundUrl : ""
        }
    ;

    function Plugin( element, options )
    {
        this.element   = element;
        this.options   = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name     = pluginName;

        this.init();
    }

    Plugin.prototype = 
    {   
        $track  : null,
        $hex    : null,
        $color  : null,
        $canvas : null,
        context : null,

        canvasWidth : 0,
        canvasHeight : 0,

        mouseIsDown : false,

        init: function()
        {           
            var _self   = this;
            this.$track = $( this.element ).find( ".track" );
            this.$hex   = $( this.element ).find( ".hex" );
            this.$color = $( this.element ).find( ".color" );

            this.canvasHeight = this.$track.height();
            this.canvasWidth  = this.$track.width();

            var hasCanvas = !!document.createElement("canvas").getContext;

            if( hasCanvas )
            {
                this.$canvas = $( "<canvas></canvas>" );
                this.$canvas.attr( "width", this.canvasWidth );
                this.$canvas.attr( "height", this.canvasHeight );    
                this.$track.html( this.$canvas );

                this.context = this.$canvas[0].getContext( "2d" );

                this.setImage();

                this.setEvents();
            }
        }, 
        
        setImage: function()
        {
            var _self         = this
            ,   colorPicker   = new Image()
            ,   backgroundUrl = this.$track.css( "background-image" ).replace( /"/g, "" ).replace( /url\(|\)$/ig, "" )
            ;

            $( colorPicker ).load( function()
            {
                _self.context.drawImage( colorPicker, 0, 0, _self.canvasWidth, _self.canvasHeight );
            });

            colorPicker.src = backgroundUrl;
        },

        setEvents: function()
        {
            var _self       = this
            ,   touchEvents = 'ontouchstart' in document.documentElement
            ;

            if( ! touchEvents )
            { 
                this.$canvas.mousedown( function( event )
                { 
                    _self.mouseIsDown = true;

                    _self.getColor.call( _self, event );

                    $( document ).bind( "mouseup.colorpicker", function( event )
                    {
                        _self.mouseIsDown = false;

                        $( document ).unbind( ".colorpicker" );

                        return false;
                    });

                    return false; 
                });

                this.$canvas.mousemove( function( event )
                {
                    _self.getColor.call( _self, event );
                });
            }
            else
            {
                this.$canvas.bind( "touchmove", function( event )
                {
                    _self.mouseIsDown = true;

                    _self.getColor.call( _self, event.originalEvent.touches[0] );

                    return false;
                });
            }

            $( this.element ).bind( "setColor", function( event, hexColor )
            { 
                _self.$hex.text( hexColor );
                _self.$color.find( ".colorInner" ).css( "backgroundColor", hexColor );
            });
        },

        getColor: function( event )
        {
            if( this.mouseIsDown )
            {
                var $target  = $( event.target )
                ,   offset   = $target.offset()
                ,   rgbColor = this.context.getImageData( event.pageX - offset.left, event.pageY - offset.top, 1, 1 ).data
                ,   hexColor = this.rgbToHex( rgbColor )
                ;
                
                this.$hex.text( hexColor );
                this.$color.find( ".colorInner" ).css( "backgroundColor", hexColor );

                $( this.element ).trigger( "colorUpdate", [ hexColor, rgbColor ] );
            }
        },

        rgbToHex: function( rgb ) 
        {
            function hex( x ) 
            {
                hexDigits = new Array( "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F" ); 
                return isNaN( x ) ? "00" : hexDigits[ ( x - x % 16 ) / 16 ] + hexDigits[ x % 16 ];
            }

            return "#" + hex( rgb[0] ) + hex( rgb[1] ) + hex( rgb[2] ); 
        }
    };

    $.fn[ pluginName ] = function( options )
    {
        return this.each(function ()
        {
            if( !$.data( this, 'plugin_' + pluginName ) )
            {
                $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
            }
        });
    };
});