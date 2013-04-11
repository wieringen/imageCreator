/**
 * @description A element cropper plugin.
 *
 * @name elementResize
 * @version 1.0
 * @author mbaijs
 */
define(
[],
function()
{
    var pluginName = 'slider'
    ,   defaults   =
        {
            scale : [ 0, 100 ]
        ,   start : 0
        ,   unit  : ""
        ,   thumbSize : 10
        ,   downScale : 1
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
            this.$track     = $( this.element ).find( ".track" );
            this.$thumb     = $( this.element ).find( ".thumb" );
            this.$indicator = $( this.element ).find( ".indicator" );

            this.setEvents();

            this.setPosition( false, this.options.start );
        },

        setEvents: function()
        {
            var _self = this
            ,   touchEvents = 'ontouchstart' in document.documentElement
            ;

            if( ! touchEvents )
            {
                this.$thumb.bind( "mousedown.slider", function( event )
                {
                    _self.start( event );

                    return false;
                });
            }
            else
            {
                this.$thumb.bind( "touchstart.slider", function( event )
                {
                    var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];

                    _self.mouse.x = touch.pageX;
                });

                this.$thumb.bind( "touchmove.slider", function( event )
                {
                    event.preventDefault();

                    var touch = event.originalEvent.touches[0] || event.originalEvent.changedTouches[0];

                    _self.drag( touch );
                });
            }

            $( this.element ).bind( "setScale", function( event, options )
            {
                _self.options.scale = [ options.min, options.max ];
                _self.options.unit  = options.unit;
                _self.options.start = options.start;
                _self.options.downScale = options.reduce;

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

            $( document ).bind( "mousemove.slider", function( event )
            {
                _self.drag( event );

                return false;
            });

            $( document ).bind( "mouseup.slider", function( event )
            {
                _self.end( event );

                return false;
            });

            this.$thumb.bind( "mouseup.slider", function( event )
            {
                _self.end( event );

                return false;
            });

            this.mouse.x = event.pageX;
        },

        end: function()
        {
            $( document ).unbind( ".slider", null );
            this.$thumb.unbind( "mouseup.slider", null );

            return false;
        },

        setPosition: function( event, scale )
        {
            var realScale = Math.round( scale * this.options.downScale )
            ,   position  = Math.round( ( realScale - this.options.scale[ 0 ] ) * ( this.$track.width() - this.options.thumbSize ) / ( this.options.scale[ 1 ] - this.options.scale[ 0 ] ) )
            ;

            this.$thumb.css( "left", position );
            this.$indicator.text( realScale + this.options.unit );
        },

        drag: function( event )
        {
            var position = Math.min( this.$track.width() - this.options.thumbSize, Math.max( 0, this.$thumb.position().left + ( event.pageX - this.mouse.x )))
            ,   scale    = Math.round( this.options.scale[ 0 ] + ( position * ( this.options.scale[ 1 ] - this.options.scale[ 0 ] ) / ( this.$track.width() - this.options.thumbSize ) ) )
            ;

            this.mouse.x = event.pageX;

            this.$thumb.css( "left", position );
            this.$indicator.text( scale + this.options.unit );

            $( this.element ).trigger( "onDrag", [ scale / this.options.downScale ] );

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