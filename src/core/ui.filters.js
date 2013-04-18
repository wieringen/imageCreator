/**
 * Image tool Class
 *
 * @name Image
 * @class Image
 * @constructor
 *
 */
define(
[
    // Module HTML template.
    //
    "text!templates/filters.html"

    // App core modules.
    //
,   "config"
,   "cache"

    // jQuery plugins.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
],
function( moduleHTML, config, cache )
{
    var module =
        {
            enabled  : true
        ,   options  : config.options.ui.filters
        ,   snippets : {}
        }

    ,   $imageCreatorViewport

    ,   $module
    ,   $filterStrength
    ,   $filterTypesList

    ,   layerCurrent = false
    ;

    module.initialize = function( options )
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport  = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module          = $( module.options.target );
        $filterStrength  = $module.find( ".filterStrength" );
        $filterTypesList = $module.find( ".filterTypesList" );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });
        $filterStrength.slider(
        {
            "start" : 100
        ,   "scale" : [ 0, 100 ]
        ,   "unit"  : "%"
        });

        // Get snippets.
        //
        module.snippets.$filterTypeSnippet = $module.find( ".filterType" ).remove();

        // Listen to global app events.
        //
        $.subscribe( "layerSelect", layerSelect );
        $.subscribe( "layerVisibility", layerSelect );

        // Listen to UI module events.
        //
        $filterStrength.bind( "onDrag", filterStrength );
        $filterTypesList.change( filterType );

        filtersCreate();
    };

    function layerSelect( event, layer )
    {
        // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
        //
        if( event.type === "layerVisibility" && ! layer.selected )
        {
            return false;
        }

        // Enable module if the layer supports filters.
        //
        module.enabled = layer.visible && layer.filter || false;

        $module.toggleClass( "moduleDisabled", ! module.enabled );
        $module.toggleClass( "moduleLocked", ! layer.locked );

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $filterStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );
            $filterTypesList.val( layerCurrent.filter.name.toLowerCase() );
        }
    }

    function filtersCreate()
    {
        $.each( module.options.types, function( filterKey, filter )
        {
            var $filterTypeClone = module.snippets.$filterTypeSnippet.clone();

            $filterTypeClone.attr( "value", filterKey );
            $filterTypeClone.text( filter.name );

            $filterTypesList.append( $filterTypeClone );
        });
    }

    function filterType( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFilter( module.options.types[ this.value ] );

            $filterStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function filterStrength( event, strength )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFilterStrength( strength );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    return module;
} );