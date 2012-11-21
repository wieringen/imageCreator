/**
 * @description A plugin that creates a tab interface.
 *
 * @name tabular
 * @version 1.0
 * @author mbaijs
 */
;(function ( $, window, document, undefined )
{
    var pluginName = 'tabular'
    ,   defaults   = 
    	{ 
	        menu : ""
	    ,   tabs : "" 
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
    	$menu      : null,
    	$menuItems : null,
    	$tabs      : null,

        init: function()
        {
        	this.$menu      = $( this.element ).find( this.options.menu );
        	this.$menuItems = this.$menu.find( "a" );
        	this.$tabs 	    = $( this.element ).find( this.options.tabs );

			this.setEvents();
        }, 
        
        setEvents: function()
        {
        	var _self = this;

			this.$menu.delegate( "a", "click", function( event )
			{ 
				var tabIndex = _self.$menuItems.index( this );

				_self.setTab( event, tabIndex );

				return false; 
			});

			$( this.element ).bind( "setTab", function( event, index )
			{ 
				_self.setTab( event, index );
			});
        },

        setTab: function( event, index )
        {
        	this.$menu.find( ".tabActive" ).removeClass( "tabActive" );
        	$( this.$menuItems[ index ] ).addClass( "tabActive" );

        	this.$tabs.filter( ".tabActive" ).removeClass( "tabActive" );
        	$( this.$tabs[ index ] ).addClass( "tabActive" );
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
