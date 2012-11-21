/**
 * @description A element cropper plugin.
 *
 * @name elementResize
 * @version 1.0
 * @author mbaijs
 */
;(function ( $, window, document, undefined )
{
    var pluginName = "elementResize"
    ,   defaults   =
        { 
            resizeCallback : null
        ,   directions : 
    		[

    			{ 
    				"name" 	     : "N" 
    			,	"position"   : [ 50, 0 ]
                ,   "positive"   : [ true, true ]
                ,   "compensate" : [ true, true ]
    			}
    		, 	{ 
    				"name" 	     : "E"
    			,  	"position"   : [ 100, 50 ] 
                ,   "positive"   : [ false, true ]
                ,   "compensate" : [ false, false ]                
    			}
            ,   { 
                    "name"       : "S" 
                ,   "position"   : [ 50, 100 ]
                ,   "positive"   : [ true, false ]
                ,   "compensate" : [ false, false ]                
                }
            ,   { 
                    "name"       : "W" 
                ,   "position"   : [ 0, 50 ]     
                ,   "positive"   : [ true, true ]
                ,   "compensate" : [ true, true ]
                }
            ,   { 
                    "name"       : "NE" 
                ,   "position"   : [ 100, 0 ]
                ,   "positive"   : [ false, true ]
                ,   "compensate" : [ false, true ]                  
                }               
    		, 	{ 
    				"name" 	     : "SE" 
    			, 	"position"   : [ 100, 100 ] 
                ,   "positive"   : [ false, false ]
                ,   "compensate" : [ false, false ]                 
    			}
    		, 	{ 
    				"name" 	     : "SW" 
    			, 	"position"   : [ 0, 100 ] 
                ,   "positive"   : [ true, false ]
                ,   "compensate" : [ true, false ]
    			}
    		, 	{ 	
    				"name" 	     : "NW" 
    			, 	"position"   : [ 0, 0 ] 
                ,   "positive"   : [ true, true ]
                ,   "compensate" : [ true, true ]                            
    			}
    		]
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
    	$directions : null,
        
        mouse : {},

        init: function()
        {
        	var _self = this;

        	this.createResizer();

        	$( this.element ).bind( "positionElementResize", function( event, position, size )
        	{
        		_self.positionResizer.call( _self, event, position, size );
        	});

            $( this.element ).bind( "visibilityElementResize", function( event, visibility )
            {
                _self.$directions.toggle( visibility || false );
            });  

            $( this.element ).delegate( ".direction", "mousedown", function( event )
            {
                _self.resizeElement.call( _self, event, $( this ) );
            });  
        }, 
        
		createResizer: function()
		{
			var _self 	    = this
			,	$direction  = $( "<div class='direction'></div>")
			;

			this.$directions = $( "<div class='directions'></div>")

			$.each( this.options.directions, function( directionIndex, direction )
			{
				var $clone = $direction.clone()
				
                $clone.addClass( "direction" + direction.name );
                
                $clone.data( "direction", direction);

				$clone.css({
					"left"       : direction.position[0] + "%"
				,	"top"        : direction.position[1] + "%"
				,	"cursor"     : direction.name.toLowerCase() + "-resize" 
				});
                
				_self.$directions.append( $clone );
			});

            this.$directions.hide();

			$( _self.element ).append( this.$directions );
		},

        positionResizer : function( event, position, size )
        { 
	    	this.$directions.css({
					"left"   : position.x
				,	"top"    : position.y
				,	"width"  : size.width -2
				,	"height" : size.height -2
	    	});
        },

        resizeElement : function( event, $direction )
        {
            var _self     = this
            ,   direction = $direction.data( "direction" )
            ;
            
            this.mouse.x = event.clientX;
            this.mouse.y = event.clientY;

            $( document ).mousemove( function( event )
            {
                var delta = 
                {
                    x : direction.positive[0] ? ( event.clientX - _self.mouse.x ) : -( event.clientX - _self.mouse.x )
                ,   y : direction.positive[1] ? ( event.clientY - _self.mouse.y ) : -( event.clientY - _self.mouse.y )
                };

                _self.options.resizeCallback( delta, direction );

                _self.mouse.x = event.clientX;
                _self.mouse.y = event.clientY;
            });

            $( document ).mouseup( function( event )
            {
                $( document ).unbind( "mousemove" );
                $( document ).unbind( "mouseup" );

                return false;
            });

            return false;
        }        
	
    };

    $.fn[ pluginName ] = function( options )
    {
        return this.each(function ()
        {
        	var dataPlugin = $.data( this, 'plugin_' + pluginName );

            if( ! dataPlugin )
            {
                $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
            }
            else
            {
            	if( 0 === $( this ).find( ".directions" ).length )
            	{
            		dataPlugin.createResizer();
            	}
            }
        });
    }
})( jQuery, window, document );
