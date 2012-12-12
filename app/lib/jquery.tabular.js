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
            menu  : "" 
        ,   tabs  : ""
        ,   pages : ""
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
        $menu  : null
    ,   $tabs  : null
    ,   $pages : null

    ,   init: function()
        {
            this.$menu  = $( this.element ).find( this.options.menu );
            this.$tabs  = $( this.element ).find( this.options.tabs );
            this.$pages = $( this.element ).find( this.options.pages );
            
            this.setEvents();
        } 
        
    ,   setEvents: function()
        {
            var _self = this;

            this.$menu.delegate( this.options.tabs, "click", function( event )
            { 
                var tabIndex = _self.$tabs.index( this );

                _self.setTab( event, tabIndex );

                return false; 
            });

            $( this.element ).bind( "setTab", function( event, index )
            {
                _self.setTab( event, index );
            });
        }

    ,   setTab: function( event, index )
        {
            this.$menu.find( ".tabActive" ).removeClass( "tabActive" );
            $( this.$tabs[ index ] ).addClass( "tabActive" );

            this.$pages.filter( ".tabActive" ).removeClass( "tabActive" );
            $( this.$pages[ index ] ).addClass( "tabActive" );

            if( "function" === typeof this.options.callback )
            {
               this.options.callback( $( this.$pages[ index ] ) );
            }
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
