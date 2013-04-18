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
    // Template.
    //
    "text!templates/filters.html"

    // Core.
    //
,   "config"
,   "cache"

    // Libraries.
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
    ,   $filtersStrength
    ,   $filtersTypesList

    ,   layerCurrent = false
    ;

    module.initialize = function( options )
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module          = $( module.options.target );
        $filtersStrength = $module.find( ".filtersStrength" );
        $filtersTypeList = $module.find( ".filtersTypeList" );

        // Initialize module ui.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });
        $filtersStrength.slider(
        {
            "start" : 100
        ,   "scale" : [ 0, 100 ]
        ,   "unit"  : "%"
        });

        // Listen for module ui events.
        //
        $filtersStrength.bind( "onDrag", filtersStrength );
        $filtersTypeList.change( filtersType );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerSelect );
        $.subscribe( "layerVisibility", layerSelect );

        // Get snippets.
        //
        module.snippets.$filterTypeSnippet = $module.find( ".filterType" ).remove();

        // Populate the module ui.
        //
        populateUI();
    };

    function populateUI()
    {
        $.each( module.options.types, function( filterKey, filter )
        {
            var $filterTypeClone = module.snippets.$filterTypeSnippet.clone();

            $filterTypeClone.attr( "value", filterKey );
            $filterTypeClone.text( filter.name );

            $filtersTypeList.append( $filterTypeClone );
        });
    }

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
            $filtersStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );
            $filtersTypeList.val( layerCurrent.filter.name.toLowerCase() );
        }
    }

    function filtersType( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFilter( module.options.types[ this.value ] );

            $filtersStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function filtersStrength( event, strength )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFilterStrength( strength );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    return module;
} );