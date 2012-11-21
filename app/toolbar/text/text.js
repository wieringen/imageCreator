 /**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace ecardBuilder.toolbar
 * @name text
 * @version 1.0
 * @author mbaijs
 */
 ;( function( $, context, appName )
 {

    var theApp        = $.getAndCreateContext( appName, context )
    ,   utils         = $.getAndCreateContext( "utils", theApp )
    ,   text          = {}

    ,   moduleEnabled = true

    ,   $ecardBuilder
    ,   $module
    ,   $textSize
    ,   $textRotate
    ,   $buttonTextAdd
    ,   $selectTextFont

    ,   layerDefault = 
        {
            id              : null
        ,   type            : "text"

        ,   text            : ""
        ,   color           : "#000000"
        ,   fontSize        : 14
        ,   font            : "Arial"

        // Unrotated position and size
        //
        ,   sizeCurrent     : { "width": 0, "height": 0 }
        ,   position        : { "x": 0, "y": 0 } 

        // Rotated position and size
        //
        ,   sizeRotated     : { "width": 0, "height": 0 }
        ,   positionRotated : { "x": 0, "y": 0 } 
        ,   rotation        : 0

        // Difference between unrotated and rotated size
        //
        ,   offset          : { "x": 0, "y": 0 }

        ,   visible         : true
        }

    ,   layerCurrent = {}
    ;

    theApp.toolbar.text = text;

    text.initialize = function( options )
    {
        settings = options;

        $ecardBuilder  = $( ".ecardBuilder" );

        // Get module DOM elements.
        //        
        $module        = $( ".toolbarText" );
        $textSize      = $module.find( ".textSize" );
        $textColor     = $module.find( ".textColor" );
        $textRotate    = $module.find( ".textRotate" );
        $buttonTextAdd = $module.find( ".buttonTextAdd" ); 
        $selectTextFont = $module.find( ".selectTextFont" ); 

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu" : ".moduleMenu"
        ,   "tabs" : ".moduleBody"
        });       
        $textSize.slider( 
        { 
            "start" : 14
        ,   "scale" : settings.textSizeScale
        ,   "unit"  : "px"
        });
        $textColor.colorPicker();
        $textRotate.circleSlider();

        // Listen to global app events.
        //
        $ecardBuilder.bind( "viewportMove", textPosition );
        $ecardBuilder.bind( "layerSelect", layerSelect );
        $ecardBuilder.bind( "layerResize", textResize );

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
        moduleEnabled = layer.type === "text" || false;
        $module.toggleClass( "moduleDisabled", ! moduleEnabled ); 

        if( moduleEnabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $textSize.trigger( "setPosition", [ layerCurrent.fontSize ] );
            $textColor.trigger( "setColor", [ layerCurrent.color ] );
        }
    }

    function textResize( event, delta, direction )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
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
        moduleEnabled = true;        

        // Clone and set layer defaults.
        // 
        layerCurrent = $.extend( true, {}, layerDefault );

        // Set layer options.
        //       
        layerCurrent.id        = "text" + new Date().getTime().toString();        
        layerCurrent.text      = "Dit is een tekst.";
        layerCurrent.layerName = layerCurrent.text;
        layerCurrent.font      = settings.font;

        layerCurrent.sizeCurrent.width  = 200;
        layerCurrent.sizeCurrent.height = 15;

        layerCurrent.sizeRotated = layerCurrent.sizeCurrent;

        textPosition( false, { y : 200, x : 50 }, true )

        $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );

        return false;
    }

    function textSize( event, fontSize )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.fontSize = fontSize;

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
            
            // Ieeuw there is no way to calculate the height so i need to get it from the dom :(
            //
            layerCurrent.sizeCurrent.height = $( "#" + layerCurrent.id + theApp.engine.name ).find( "p" ).height();
            
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );
            
            layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + ( layerCurrent.sizeRotated.width  - layerCurrent.sizeCurrent.width ) / 2  );
            layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function textFont( event )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.font = $( this ).val();

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function textColor( event, hexColor )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.color = hexColor;

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function textRotate( event, degrees )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.rotation    = degrees;
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, degrees );

            textPosition( false, { x: 0, y: 0 }, true );

            // Tell the app there a change in the current layer's rotation.
            //
            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function textPosition( event, delta, internal )
    {
        if( layerCurrent && layerCurrent.visible && moduleEnabled )
        {
            layerCurrent.position.x = Math.round( layerCurrent.position.x + delta.x );
            layerCurrent.position.y = Math.round( layerCurrent.position.y + delta.y );

            layerCurrent.offset.x = Math.round( ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2 );
            layerCurrent.offset.y = Math.round( ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.positionRotated.x = layerCurrent.position.x - layerCurrent.offset.x;
            layerCurrent.positionRotated.y = layerCurrent.position.y - layerCurrent.offset.y;

            textConstrain();

            if( ! internal )
            {
                $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
            }
        }
    }

    function textConstrain()
    {
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
   

} )( jQuery, window, "ecardBuilder" );