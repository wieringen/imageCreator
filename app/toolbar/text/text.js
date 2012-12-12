 /**
 * @description <p></p>
 *
 * @namespace ecardBuilder.toolbar
 * @name text
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery"

    // Module HTML template.
    //
,   "text!toolbar/text/text.html"

    // App core modules.
    //
,   "utils"

    // jQuery plugins.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
,   "plugins/jquery.circleSlider"
,   "plugins/jquery.colorPicker"
],
function( $, moduleHTML, utils )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name     : "text"
        ,   target   : ".toolbarText"
        ,   enabled  : true
        ,   settings : 
            {
                textSizeScale  : [ 10, 100 ]
            ,   font           : "Arial"               
            }
        }

    ,   $ecardBuilder
    ,   $module
    ,   $textSize
    ,   $textRotate
    ,   $buttonTextAdd
    ,   $buttonTextBold
    ,   $buttonTextItalic
    ,   $selectTextFont

    // The default properties of a text layer.
    //
    ,   layerDefault = 
        {
            id              : null
        ,   type            : "text"
        ,   visible         : true

        ,   text            : ""
        ,   color           : "#000000"
        ,   fontSize        : 14
        ,   font            : "Arial"

        // Unrotated position and size.
        //
        ,   sizeCurrent     : { "width": 0, "height": 0 }
        ,   position        : { "x": 0, "y": 0 } 

        // Rotated position and size.
        //
        ,   sizeRotated     : { "width": 0, "height": 0 }
        ,   positionRotated : { "x": 0, "y": 0 } 

        // Difference between unrotated and rotated size.
        //
        ,   offset          : { "x": 0, "y": 0 }

        // Matrix calculations.
        //
        ,   scale           : 1
        ,   rotation        : { degrees: 0, radians : 0, sin: 0, cos: 1 }
        ,   matrix          : [ 1, 0, 0, 1, 0, 0 ]
        }

    // The curent layer that is being edited.
    //
    ,   layerCurrent = {}
    ;

    module.initialize = function( options )
    {
        // Append module HTML.
        //
        $( module.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $ecardBuilder  = $( ".ecardBuilder" );

        // Get module DOM elements.
        //        
        $module           = $( ".toolbarText" );
        $textSize         = $module.find( ".textSize" );
        $textColor        = $module.find( ".textColor" );
        $textRotate       = $module.find( ".textRotate" );
        $buttonTextAdd    = $module.find( ".buttonTextAdd" );
        $buttonTextBold   = $module.find( ".buttonTextBold" );
        $buttonTextItalic = $module.find( ".buttonTextItalic" ); 
        $selectTextFont   = $module.find( ".selectTextFont" ); 

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleBody"
        }); 
        $textSize.slider( 
        { 
            "start" : 14
        ,   "scale" : module.settings.textSizeScale
        ,   "unit"  : "px"
        });
        $textRotate.circleSlider();
        $textColor.colorPicker();

        // Listen to global app events.
        //
        $ecardBuilder.bind( "viewportMove", textPosition );
        $ecardBuilder.bind( "layerSelect", layerSelect );
        $ecardBuilder.bind( "layerResize", textResize );

        // Listen to selection events.
        //        
        $ecardViewport.bind( "onRotate", textRotate );

        // Listen to UI module events.
        //           
        $textSize.bind( "onDrag", textSize );
        $textRotate.bind( "onDrag", textRotate );
        $textColor.bind( "colorUpdate", textColor );

        // Set Button events.
        //             
        $buttonTextAdd.click( textAdd );
        $selectTextFont.change( textFont );
    };

    function layerSelect( event, layer )
    {
        // Enable module if layer is of the correct type.
        //
        module.enabled = layer.type === "text" || false;
        $module.toggleClass( "moduleDisabled", ! module.enabled ); 

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $textRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            $textSize.trigger( "setPosition", [ layerCurrent.fontSize ] );
            $textColor.trigger( "setColor", [ layerCurrent.color ] );
        }
    }

    function textResize( event, delta, direction )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.sizeRotated.width  = Math.max( 20, layerCurrent.sizeRotated.width  - delta.x );
            layerCurrent.sizeRotated.height = Math.max( 20, layerCurrent.sizeRotated.height - delta.y );
            
            layerCurrent.sizeCurrent = utils.getRectSizeInsideBoundingBox( layerCurrent.sizeRotated, layerCurrent.rotation );
            
            layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2  );
            layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            textPosition( false, { x : ( direction.compensate[0] ? delta.x : 0 ), y: ( direction.compensate[1] ? delta.y : 0 ) }, true );

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textAdd( event )
    {
        // Since we are adding a new text we can enable the module savely.
        //
        module.enabled = true;        

        // Clone and set layer defaults.
        // 
        layerCurrent = $.extend( true, {}, layerDefault );

        // Set layer options.
        //       
        layerCurrent.id        = "text" + new Date().getTime().toString();        
        layerCurrent.text      = "Dit is een tekst.";
        layerCurrent.layerName = layerCurrent.text;
        layerCurrent.font      = module.settings.font;

        layerCurrent.sizeCurrent.width  = 200;
        layerCurrent.sizeCurrent.height = 15;

        layerCurrent.sizeRotated = layerCurrent.sizeCurrent;

        textPosition( false, { y : 200, x : 50 }, true )

        $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );

        return false;
    }

    function textSize( event, fontSize )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.fontSize = fontSize;

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
            
            // Ieeuw there is no way to calculate the height so i need to get it from the dom :(
            //
            var $textLayer = $( "#" + layerCurrent.id + theApp.engine.name );

            if( $textLayer[0].nodeName !== "P" )
            {
                $textLayer = $textLayer.find( "p" );  
            }
            
            layerCurrent.sizeCurrent.height = $textLayer.height();
            
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );
            
            layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + ( layerCurrent.sizeRotated.width  - layerCurrent.sizeCurrent.width ) / 2  );
            layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.matrix = utils.getMatrix( layerCurrent.rotation, 1, layerCurrent.position, layerCurrent.sizeCurrent );

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function textFont( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.font = $( this ).val();

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function textColor( event, hexColor )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.color = hexColor;

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function textRotate( event, rotation )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            if( "onRotate" === event.type )
            {
                $textRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            }            

            layerCurrent.rotation    = rotation;
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

            textPosition( false, { x: 0, y: 0 }, true );

            // Tell the app there a change in the current layer's rotation.
            //
            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textPosition( event, delta, internal )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.position.x = Math.round( layerCurrent.position.x + delta.x );
            layerCurrent.position.y = Math.round( layerCurrent.position.y + delta.y );

            layerCurrent.offset.x = Math.round( ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2 );
            layerCurrent.offset.y = Math.round( ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.positionRotated.x = layerCurrent.position.x - layerCurrent.offset.x;
            layerCurrent.positionRotated.y = layerCurrent.position.y - layerCurrent.offset.y;

            textConstrain();

            layerCurrent.matrix = utils.getMatrix( layerCurrent.rotation, 1, layerCurrent.position, layerCurrent.sizeCurrent );

            if( ! internal )
            {
                $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
            }
        }
    }

    function textConstrain()
    {
        if( theApp.toolbar.layers && ! theApp.toolbar.layers.settings.constrainLayers )
        {
            return false;
        }
        
        var ratio = { 
            width  : theApp.settings.viewportWidth - layerCurrent.sizeRotated.width
        ,   height : theApp.settings.viewportHeight - layerCurrent.sizeRotated.height
        };

        if(layerCurrent.positionRotated.x <= 0 + ( ratio.width < 0 ? ratio.width : 0) )
        { 
            layerCurrent.positionRotated.x = Math.round( ratio.width < 0 ? ratio.width : 0 );
        }

        if(layerCurrent.positionRotated.y <= 0 + ( ratio.height < 0 ? ratio.height : 0) )
        { 
            layerCurrent.positionRotated.y = Math.round( ratio.height < 0 ? ratio.height : 0 );
        }

        if(layerCurrent.positionRotated.x + ( ratio.width < 0 ? ratio.width : 0) >= ratio.width )
        { 
            layerCurrent.positionRotated.x = Math.round( ratio.width < 0 ? 0 : ratio.width );
        }

        if(layerCurrent.positionRotated.y + ( ratio.height < 0 ? ratio.height : 0) >= ratio.height )
        { 
            layerCurrent.positionRotated.y = Math.round( ratio.height < 0 ? 0 : ratio.height );
        }

        layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + layerCurrent.offset.x );
        layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + layerCurrent.offset.y );
    }
   
    return module;
} );