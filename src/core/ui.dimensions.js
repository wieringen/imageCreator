 /**
 * @description <p></p>
 *
 * @namespace imageCreator.toolbar
 * @name text
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // Module HTML template.
    //
    "text!templates/dimensions.html"

    // App core modules.
    //
,   "config"
,   "cache"
,   "util.math"

    // jQuery plugins.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
,   "plugins/jquery.circleslider"
],
function( moduleHTML, config, cache, utilMath )
{
    var module =
        {
            name     : "dimensions"
        ,   enabled  : true
        ,   options  : config.options.ui.dimensions
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorSelection

    ,   $module
    ,   $moduleTitle
    ,   $textSize
    ,   $textRotate

    // The curent layer that is being edited.
    //
    ,   layerCurrent = false
    ;

    /**
      * @description Function that initializes the module. It will append the modules html, set the title and initializes its UI.
      *
      * @name module#initialize
      * @function
      *
      */
    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport  = $( ".imageCreatorViewport" );
        $imageCreatorSelection = $( ".imageCreatorSelection" );

        // Get module DOM elements.
        //
        $module           = $( ".imageCreatorUIDimensions" );
        $moduleTitle      = $module.find( ".moduleTitle" );
        $textSize         = $module.find( ".dimensionsScale" );
        $textRotate       = $module.find( ".dimensionsRotate" );

        // Set module title.
        //
        $moduleTitle.text( module.options.title );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });
        $textSize.slider();
        $textRotate.circleSlider();

        // Listen to global app events.
        //
        $.subscribe( "layerSelect", textSelect );
        $.subscribe( "layerVisibility", textSelect );
        $.subscribe( "selectionScale", dimensionsScale );
        $.subscribe( "selectionRotate", dimensionsRotate );

        // Listen to UI module events.
        //
        $textSize.bind( "onDrag", dimensionsScale );
        $textRotate.bind( "onDrag", dimensionsRotate );
    };

    /**
      * @description Function that select a certain text layer and sets or disables the modules UI.
      *
      * @name textSelect
      * @function
      *
      */
    function textSelect( event, layer )
    {
        // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
        //
        if( event.type === "layerVisibility" && ! layer.selected )
        {
            return false;
        }

        // Enable module if layer is of the correct type and is visible.
        //
        module.enabled = ! layer.locked && layer.visible || false;

        $module.toggleClass( "moduleDisabled", ! module.enabled );

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $textRotate.trigger( "setPosition", [ Math.round( layerCurrent.rotation.degrees ) ] );
            $textSize.trigger( "setScale", [ module.options.scale[ layerCurrent.type ] ] );
            $textSize.trigger( "setPosition", [ layerCurrent.fontSize || layerCurrent.scale ] );
        }
    }

    function dimensionsRotate( event, rotation, setUI )
    {
        if( setUI )
        {
            $textRotate.trigger( "setPosition", [ rotation.degrees ] );

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
            $textSize.trigger( "setScale", [ module.options.scale[ layerCurrent.type ] ] );
            $textSize.trigger( "setPosition", [ scale ] );

            return false;
        }

        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setScale( scale );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    return module;
} );
