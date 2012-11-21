/**
 * @description Plugin for creating circular meters.
 *
 * @name circleSlider
 * @version 1.0
 * @author mbaijs
 */

;(function ( $, window, document, undefined )
{
    var pluginName = 'circleSlider'
    ,   defaults   = { }
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
        $track   : null,
        $thumb   : null,
        $degrees : null,

        init: function()
        {
            this.$track   = $( this.element ).find( ".track" )
            this.$thumb   = $( this.element ).find( ".thumb" )
            this.$degrees = $( this.element ).find( ".degrees" )

            this.setEvents();
        }, 
        
        setEvents: function()
        {
            var _self = this;

            this.$thumb.mousedown( function( event )
            { 
                _self.start( event ); 

                return false; 
            });

            $( this.element ).bind( "setPosition", function( event, degrees )
            { 
                _self.setPosition( event, degrees ) 
            });
        },

        start: function()
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
        },
        
        end: function()
        {
            $( document ).unbind( "mousemove", null );
            $( document ).unbind( "mouseup", null );
            this.$thumb.unbind( "mouseup", null );

            return false;
        },

        setPosition: function( event, degrees )
        {
            var sanitizedDegrees = degrees || 0;

            this.$degrees.html( sanitizedDegrees + "&deg;" );

            this.$thumb.css(  "top", Math.round( -Math.cos( sanitizedDegrees * ( Math.PI / 180 ) ) * 34 +42 ) );
            this.$thumb.css( "left", Math.round(  Math.sin( sanitizedDegrees * ( Math.PI / 180 ) ) * 34 +42 ) );    
            this.$thumb.css( "transform", "rotate(" + degrees + "deg)" );       
        },

        drag: function( event )
        {
            var position = 
            {
                x : event.pageX - this.$track.offset().left -41
            ,   y : event.pageY - this.$track.offset().top  -41
            }
            ,   angle   = Math.atan2( position.x, -position.y )
            ,   degrees = Math.round( angle * 180 / Math.PI )
            ;

            degrees = degrees < 0 ? degrees +360 : degrees;
            
            this.$degrees.html( degrees + "&deg;" );

            this.$thumb.css(  "top", Math.round( -Math.cos( angle ) * 34 +42 ) );
            this.$thumb.css( "left", Math.round(  Math.sin( angle ) * 34 +42 ) );
            this.$thumb.css( "transform", "rotate(" + degrees + "deg)" );

            $( this.element ).trigger( "onDrag", [ degrees ] );
            
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
})( jQuery, window, document );
