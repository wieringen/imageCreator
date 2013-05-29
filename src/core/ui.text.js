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
    // Template.
    //
    "text!templates/text.html"

    // Core.
    //
,   "config"
,   "cache"
,   "model.text"
,   "cs!util.math"

    // Libraries.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.colorpicker"
],
function( moduleHTML, config, cache, modelText, utilMath )
{
    var module =
        {
            enabled  : true
        ,   options  : config.options.ui.text
        ,   snippets : {}
        }

    ,   $imageCreatorViewport

    ,   $module
    ,   $textColor
    ,   $textWeightBtn
    ,   $textStyleBtn
    ,   $textFontSelect

    // The curent layer that is being edited.
    //
    ,   layerCurrent = false
    ;

    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module         = $( module.options.target );
        $textColor      = $module.find( ".textColor" );
        $textWeightBtn  = $module.find( ".textWeightBtn" );
        $textStyleBtn   = $module.find( ".textStyleBtn" );
        $textFontSelect = $module.find( ".textFontSelect" );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });
        $textColor.colorPicker();

        // Listen for module UI events.
        //
        $textColor.bind( "colorUpdate", textColor );
        $textWeightBtn.click( textWeight );
        $textStyleBtn.click( textStyle );
        $textFontSelect.change( textFont );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerSelect );
        $.subscribe( "layerVisibility", layerSelect );

        // temp
        //
        $( ".buttonTextAdd" ).click( textAdd );
    };

    function layerSelect( event, layer )
    {
        // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
        //
        if( event.type === "layerVisibility" && ! layer.selected )
        {
            return false;
        }

        // Enable module if layer is of the correct type and is visible.
        //
        module.enabled = layer.visible && layer.type === "text" || false;
        $module.toggleClass( "moduleDisabled", ! module.enabled );

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $textColor.trigger( "setColor", [ layerCurrent.color ] );
            $textWeightBtn.toggleClass( "active", layerCurrent.weight );
            $textStyleBtn.toggleClass( "active", layerCurrent.style );
            $textFontSelect.val( layerCurrent.font );
        }
    }

    function textAdd()
    {
        var text  = module.options.defaultText
        ,   layer =
            {
                text : text.slice( 0, utilMath.getRandomInt( 10, text.length ) )
            }
        ;

        cache.setLayerActive( new modelText( layer ) );

        return false;
    }

    function textStyle( event, style )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setStyle( ! layerCurrent.style );

            $textStyleBtn.toggleClass( "active", layerCurrent.style );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textWeight( event, weight )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setWeight( ! layerCurrent.weight );

            $textWeightBtn.toggleClass( "active", layerCurrent.weight );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textFont( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFont( this.value );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textColor( event, color )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setColor( color );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    return module;
} );
