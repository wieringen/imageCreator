/**
 * @description A element cropper plugin.
 *
 * @name elementResize
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery"
],
function( $ )
{
    var pluginName = 'slider'
    ,   defaults   = 
        { 
            scale : [ 0, 100 ]
        ,   start : 0
        ,   unit  : ""
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
        $track      : null,
        $thumb      : null,
        $percentage : null,
        mouse       : { x : 0, y : 0 },

        init: function()
        {
            this.$track     = $( this.element ).find( ".track" )
            this.$thumb     = $( this.element ).find( ".thumb" )
            this.$indicator = $( this.element ).find( ".indicator" )

            this.setEvents();

            this.setPosition( false, this.options.start );
        }, 
        
        setEvents: function()
        {
            var _self = this;

            this.$thumb.mousedown( function( event )
            { 
                _self.start( event ); 

                return false; 
            });

            $( this.element ).bind( "setPosition", function( event, position )
            { 
                _self.setPosition( event, position ); 

                return false; 
            });         
        },

        start: function( event )
        {
            var _self = this;

            $( document ).mousemove( function( event )
            {
                _self.drag( event );

                return false;
            });

            $( document ).mouseup( function( event )
            {
                _self.end( event );

                return false;
            });

            this.$thumb.mouseup( function( event )
            {
                _self.end( event );

                return false;
            });
        
            this.mouse.x = event.pageX;
        },
        
        end: function()
        {
            $( document ).unbind( "mousemove", null );
            $( document ).unbind( "mouseup", null );
            this.$thumb.unbind( "mouseup", null );

            return false;
        },

        setPosition: function( event, scale )
        {
            var sanitizedScale = Math.min( this.options.scale[ 1 ], Math.max( this.options.scale[ 0 ], scale || 0 ) )
            ,   realScale      = sanitizedScale - this.options.scale[ 0 ]
            ,   position       = Math.round( realScale * ( this.$track.width() - this.$thumb.width() ) / ( this.options.scale[ 1 ] - this.options.scale[ 0 ] ) )
            ;

            this.$thumb.css( "left", position );
            this.$indicator.text( sanitizedScale + this.options.unit );         
        },

        drag: function( event )
        {
            var position = Math.min( this.$track.width() - this.$thumb.width(), Math.max( 0, this.$thumb.position().left + ( event.pageX - this.mouse.x )))
            ,   scale    = Math.round( this.options.scale[ 0 ] + ( position * ( this.options.scale[ 1 ] - this.options.scale[ 0 ] ) / ( this.$track.width() - this.$thumb.width() ) ) )
            ;

            this.mouse.x = event.pageX;

            this.$thumb.css( "left", position );
            this.$indicator.text( scale + this.options.unit );

            $( this.element ).trigger( "onDrag", [ scale, position ] );
            
            return false;
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
    }
});