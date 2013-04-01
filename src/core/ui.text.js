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
,   "plugins/jquery.slider"
,   "plugins/jquery.circleslider"
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
    ,   $module
    ,   $moduleTitle
    ,   $imageCreatorSelection  
    ,   $textSize
    ,   $textRotate
    ,   $buttonTextAdd
    ,   $buttonTextWeight
    ,   $buttonTextStyle
    ,   $selectTextFont
    ,   $areaTextEdit

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
        $module           = $( ".imageCreatorToolText" );
        $moduleTitle      = $module.find( ".moduleTitle" );
        $textSize         = $module.find( ".textSize" );
        $textColor        = $module.find( ".textColor" );
        $textRotate       = $module.find( ".textRotate" );
        $buttonTextAdd    = $module.find( ".buttonTextAdd" );
        $buttonTextWeight = $module.find( ".buttonTextWeight" );
        $buttonTextStyle  = $module.find( ".buttonTextStyle" ); 
        $areaTextEdit     = $module.find( ".areaTextEdit" );
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
        $textSize.slider( 
        { 
            "start" : 14
        ,   "scale" : module.options.textSizeScale
        ,   "unit"  : "px"
        });
        $textRotate.circleSlider();
        $textColor.colorPicker();

        // Listen to global app events.
        // 
        $.subscribe( "viewportPinch", textPinch );
        $.subscribe( "viewportMove", textPosition );        
        $.subscribe( "layerSelect", textSelect );
        $.subscribe( "layerVisibility", textSelect );

        // Listen to selection events.
        //        
        $imageCreatorSelection.bind( "onRotate", textRotate );
        //$imageCreatorSelection.bind( "onResize", textResize );

        // Listen to UI module events.
        //           
        $textSize.bind( "onDrag", textSize );
        $textRotate.bind( "onDrag", textRotate );
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
            $textRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            $textSize.trigger( "setPosition", [ layerCurrent.fontSize ] );
            $textColor.trigger( "setColor", [ layerCurrent.color ] );
            $buttonTextWeight.toggleClass( "active", layerCurrent.weight ); 
            $buttonTextStyle.toggleClass( "active", layerCurrent.style ); 
            $selectTextFont.val( layerCurrent.font );
        }
    }

    function textAdd()
    {
        var lorum = "Lorem ipsum dolor sit amet.\nConsectetur adipiscing elit. Proin malesuada.\nLigula in blandit rutrum, libero ipsum luctus augue, diam sagittis dui.\nVivamus fermentum urna sit amet libero volutpat ac consectetur purus placerat."
        ,   layer = 
            {
                text : lorum.slice( 0, utilMath.getRandomInt( 10, lorum.length ) )
            }
        ;

        cache.setLayerActive( new modelText( layer ) );

        return false;        
    }

   function textPinch( event, delta )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            var deltaScale    = layerCurrent.fontSize + ( delta.scale * 10 )
            ,   radians       = utilMath.sanitizeRadians( layerCurrent.rotation.radians + utilMath.toRadians( delta.rotate ) )
            ,   deltaRotation = 
                {
                    radians : radians
                ,   degrees : Math.round( utilMath.toDegrees( radians ) )
                ,   sin     : Math.sin( radians )
                ,   cos     : Math.cos( radians )
                }
            ;

            textRotate( event, deltaRotation, true );
            textSize( event, deltaScale, true );
        }
    }

    function textRotate( event, rotation )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setRotate( rotation );
            
            if( "onRotate" === event.type )
            {
                $textRotate.trigger( "setPosition", [ rotation.degrees ] );
            }            

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textSize( event, fontSize )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFontSize( fontSize );
            
            $.publish( "layerUpdate", [ layerCurrent ] );
        }
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

    function textPosition( event, delta )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setPosition( delta );

            $.publish( "layerUpdate", [ layerCurrent, true ] );
        }
    }

    return module;
} );
