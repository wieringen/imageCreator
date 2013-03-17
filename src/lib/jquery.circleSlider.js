/**
 * @description Plugin for creating circular meters.
 *
 * @name circleSlider
 * @version 1.0
 * @author mbaijs
 */
define(
[],
function()
{
    var pluginName = "circleSlider"
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
            this.$track   = $( this.element ).find( ".track" );
            this.$thumb   = $( this.element ).find( ".thumb" );
            this.$degrees = $( this.element ).find( ".degrees" );

            this.setEvents();
        }, 
        
        setEvents: function()
        {
            var _self       = this
            ,   touchEvents = 'ontouchstart' in document.documentElement
            ;

            if( ! touchEvents )
            { 
                this.$track.bind( "mousedown.circleslider", function( event )
                { 
                    _self.start( event ); 

                    return false; 
                });
            }
            else
            {
                this.$track.bind( "touchmove.circleslider", function( event )
                {
                    var target = event.originalEvent.touches && event.originalEvent.touches[0] || event.originalEvent;

                    _self.drag( target );

                   return false;
                });
            }

            $( this.element ).bind( "setPosition", function( event, degrees )
            { 
                _self.setPosition( event, degrees );
            });
        },

        start: function()
        {
            var _self = this;

            $( document ).bind( "mousemove.circleslider", function( event )
            {
                _self.drag( event );

                return false;
            });

            $( document ).bind( "mouseup.circleslider", function( event )
            {
                _self.end( event );

                return false;
            });

            this.$thumb.bind( "mouseup.circleslider", function( event )
            {
                _self.end( event );

                return false;
            });
        },
        
        end: function()
        {
            $( document ).unbind( ".circleslider", null );
            this.$thumb.unbind( "mouseup.circleslider", null );

            return false;
        },

        setPosition: function( event, degrees )
        {
            var sanitizedDegrees = degrees || 0;

            this.$degrees.html( sanitizedDegrees + "&deg;" );

            this.$thumb.css(  "top", Math.round( -Math.cos( sanitizedDegrees * ( Math.PI / 180 ) ) * 34 +42 ) );
            this.$thumb.css( "left", Math.round(  Math.sin( sanitizedDegrees * ( Math.PI / 180 ) ) * 34 +42 ) );    
            this.$thumb.css( "transform",       "rotate(" + degrees + "deg)" ); 
            this.$thumb.css( "webkitTransform", "rotate(" + degrees + "deg)" );   
            this.$thumb.css( "msTransform",     "rotate(" + degrees + "deg)" );      
        },

        sanitizeRadians: function( radians )
        {
            var max = 2 * Math.PI;
            return radians < 0 ? max + radians : ( radians > max ? radians - max : radians );
        },

        drag: function( event )
        {
            var position = 
                {
                    x : event.pageX - this.$track.offset().left -41
                ,   y : event.pageY - this.$track.offset().top  -41
                }
            ,   radians = this.sanitizeRadians( Math.atan2( position.x, -position.y ) )
            ,   degrees = Math.round( radians * 180 / Math.PI )
            ,   cos     = Math.cos( radians )
            ,   sin     = Math.sin( radians )
            ;
            this.$degrees.html( degrees + "&deg;" );
            this.$thumb.css( "top",  Math.round( -cos * 34 +42 ) );
            this.$thumb.css( "left", Math.round(  sin * 34 +42 ) );
            this.$thumb.css( "transform",       "rotate(" + degrees + "deg)" );
            this.$thumb.css( "webkitTransform", "rotate(" + degrees + "deg)" );
            this.$thumb.css( "msTransform",     "rotate(" + degrees + "deg)" );      

            var rotation = {
                    degrees : degrees
                ,   radians : radians
                ,   sin     : sin
                ,   cos     : cos
            };

            $( this.element ).trigger( "onDrag", [ rotation ] );
            
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
    };
});
