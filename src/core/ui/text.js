/**
*
* @module text
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
,   "cs!model/text"
,   "cs!util/math"

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
    ,   $textEdit
    ,   $textColor
    ,   $textWeightBtn
    ,   $textStyleBtn
    ,   $textFontSelect
    ,   $textAlignBtn

    // The curent layer that is being edited.
    //
    ,   layerCurrent = false
    ,   editing      = false
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
        $textEdit       = $( ".imageCreatorSelectionTextEdit" );
        $textColor      = $module.find( ".textColor" );
        $textWeightBtn  = $module.find( ".textWeightBtn" );
        $textStyleBtn   = $module.find( ".textStyleBtn" );
        $textFontSelect = $module.find( ".textFontSelect" );
        $textAlignBtn   = $module.find( ".textAlignBtn" );

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
        $textEdit.bind( "keydown keyup blur change", textSet );
        $textColor.bind( "colorUpdate", textColor );
        $textWeightBtn.click( textWeight );
        $textStyleBtn.click( textStyle );
        $textFontSelect.change( textFont );
        $textAlignBtn.click( textAlign );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerSelect );
        $.subscribe( "layerEdit", layerEdit );
        $.subscribe( "layerUpdate", layerUpdate );
        $.subscribe( "layerVisibility", layerVisibility );

        // temp
        //
        $( ".buttonTextAdd" ).click( textAdd );
    };

    function layerVisibility( event, layer )
    {
        if( layer.selected )
        {
            // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
            //
            layerSelect( event, layer, true );

            $textEdit.toggle( editing && layer.visible );
        }
    }

    function layerSelect( event, layer, keepEditing )
    {
        // Enable module if layer is visible and can have text.
        //
        module.enabled = layer.visible && layer.canHaveText || false;
        $module.toggleClass( "moduleDisabled", ! module.enabled );

        // If we are in editing mode and we dont persist on editing stop editing mode.
        //
        if( ! keepEditing && editing )
        {
            layerEdit( event, false );
        }

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $textColor.trigger( "setColor", [ layerCurrent.color ] );
            $textWeightBtn.toggleClass( "active", layerCurrent.weight );
            $textStyleBtn.toggleClass( "active", layerCurrent.style );
            $textFontSelect.val( layerCurrent.font );
            $textAlignBtn.removeClass( "active" );
            $textAlignBtn.filter( "[data-align=" + layerCurrent.textAlign + "]" ).addClass( "active" );
        }
    }

    function layerEdit( event, layer )
    {
        if( module.enabled && layer.canHaveText )
        {
            editing = true;

            $textEdit.val( layer.text );

            layerUpdate( event, layer );

            $textEdit.focus();
        }
        else
        {
            editing = false;

            $textEdit.hide();
        }
    }

    function layerUpdate( event, layer )
    {
        if( module.enabled && layer.canHaveText && editing )
        {
            $textEdit.css({
                "width"      : layer.sizeCurrent.width
            ,   "height"     : layer.sizeCurrent.height
            ,   "left"       : layer.position.x
            ,   "top"        : layer.position.y
            ,   "textAlign"  : layer.textAlign
            ,   "fontWeight" : layer.weight ? "bold" : "normal"
            ,   "display"    : "block"
            ,   "lineHeight" : Math.floor( layer.fontSize * layer.lineHeight ) + "px"
            ,   "fontSize"   : layer.fontSize
            ,   "fontFamily" : layer.font
            ,   "transform"  : "rotate(" + layer.rotation.degrees + "deg )"
            });
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

    function textAlign( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setTextAlign( $( this ).attr( "data-align" ) );

            $textAlignBtn.removeClass( "active" );

            $( this ).addClass( "active" );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textSet()
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setText( this.value );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    return module;
} );
