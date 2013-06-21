/**
*
* @module dimensions
*/

define(
[
    // Template.
    //
    "text!templates/dimensions.html"

    // Core.
    //
,   "config"
,   "cache"
,   "cs!util.math"

    // Libraries.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
,   "plugins/jquery.circleslider"
],
function( moduleHTML, config, cache, utilMath )
{
    var module =
        {
            enabled  : true
        ,   options  : config.options.ui.dimensions
        ,   snippets : {}
        }

    ,   $imageCreatorViewport

    ,   $module
    ,   $dimensionsScale
    ,   $dimensionsRotate

    // The curent layer that is selected.
    //
    ,   layerCurrent = false
    ;

    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module           = $( module.options.target );
        $dimensionsScale  = $module.find( ".dimensionsScale" );
        $dimensionsRotate = $module.find( ".dimensionsRotate" );

        // Initialize module ui.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });
        $dimensionsScale.slider();
        $dimensionsRotate.circleSlider();

        // Listen for module ui events.
        //
        $dimensionsScale.bind( "onDrag", dimensionsScale );
        $dimensionsRotate.bind( "onDrag", dimensionsRotate );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerSelect );
        $.subscribe( "layerVisibility", layerVisibility );

        // Listen for selection events.
        //
        $.subscribe( "selectionScale", dimensionsScale );
        $.subscribe( "selectionRotate", dimensionsRotate );
    };

    function layerVisibility( event, layer )
    {
        if( layer.selected )
        {
            // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
            //
            layerSelect( event, layer );
        }
    }

    function layerSelect( event, layer )
    {
        // Enable module if layer is of the correct type and is visible.
        //
        module.enabled = ! layer.locked && layer.visible || false;

        $module.toggleClass( "moduleDisabled", ! module.enabled );

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $dimensionsRotate.trigger( "setPosition", [ Math.round( layerCurrent.rotation.degrees ) ] );
            $dimensionsScale.trigger( "setScale", [ module.options.scale[ layerCurrent.type ] ] );
            $dimensionsScale.trigger( "setPosition", [ layerCurrent.fontSize || layerCurrent.scale ] );
        }
    }

    function dimensionsRotate( event, rotation, setUI )
    {
        if( setUI )
        {
            $dimensionsRotate.trigger( "setPosition", [ rotation.degrees ] );

            return false;
        }

        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setRotate( rotation );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function dimensionsScale( event, scale, setUI )
    {
        if( setUI )
        {
            $dimensionsScale.trigger( "setScale", [ module.options.scale[ layerCurrent.type ] ] );
            $dimensionsScale.trigger( "setPosition", [ scale ] );

            return false;
        }

        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            if( layerCurrent.setFontSize )
            {
                layerCurrent.setFontSize( scale );
            }
            else
            {
                layerCurrent.setScale( scale );
            }

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    return module;
} );
