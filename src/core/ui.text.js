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
    "text!templates/text.html"

    // App core modules.
    //
,   "config"
,   "cache"
,   "model.text"
,   "util.math"

    // jQuery plugins.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.colorpicker"
],
function( moduleHTML, config, cache, modelText, utilMath )
{
    var module =
        {
            name     : "text"
        ,   enabled  : true
        ,   options  : config.options.ui.text
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorSelection
    ,   $imageCreatorToolbar

    ,   $module
    ,   $moduleTitle
    ,   $textSize
    ,   $textRotate
    ,   $buttonTextAdd

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
        $imageCreatorToolbar   = $( ".imageCreatorToolbar" );

        // Get module DOM elements.
        //
        $module           = $( ".imageCreatorUIText" );
        $moduleTitle      = $module.find( ".moduleTitle" );
        $textColor        = $module.find( ".textColor" );
        $buttonTextAdd    = $( ".buttonTextAdd" );
        $buttonTextWeight = $module.find( ".buttonTextWeight" );
        $buttonTextStyle  = $module.find( ".buttonTextStyle" );
        $selectTextFont   = $module.find( ".selectTextFont" );

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
        $textColor.colorPicker();

        // Listen to global app events.
        //
        $.subscribe( "layerSelect", textSelect );
        $.subscribe( "layerVisibility", textSelect );

        // Listen to UI module events.
        //
        $textColor.bind( "colorUpdate", textColor );

        // Set module input / button events.
        //
        $buttonTextAdd.click( textAdd );
        $buttonTextWeight.click( textWeight );
        $buttonTextStyle.click( textStyle );
        $selectTextFont.change( textFont );
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
        module.enabled = layer.visible && layer.type === "text" || false;
        $module.toggleClass( "moduleDisabled", ! module.enabled );

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $textColor.trigger( "setColor", [ layerCurrent.color ] );
            $buttonTextWeight.toggleClass( "active", layerCurrent.weight );
            $buttonTextStyle.toggleClass( "active", layerCurrent.style );
            $selectTextFont.val( layerCurrent.font );
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

            $buttonTextStyle.toggleClass( "active", layerCurrent.style );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textWeight( event, weight )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setWeight( ! layerCurrent.weight );

            $buttonTextWeight.toggleClass( "active", layerCurrent.weight );

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