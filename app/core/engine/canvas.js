/**
 * @description <p>The Canvas engine implementation.</p>
 *
 * @namespace ecardBuilder.engine
 * @name canvas
 * @version 1.0
 * @author mbaijs
 */
 ;( function( $, context, appName )
 {
    var theApp = $.getAndCreateContext( appName, context )
    ,   utils  = $.getAndCreateContext( "utils", theApp )
    ,   canvas = { 
            name : "canvas" 
        }

    ,   $ecardBuilder
    ,   $ecardViewport
    ,   $canvas
    ,   $context

    ,   canvasWidth
    ,   canvasHeight
    ;

    theApp.engine = canvas;

    canvas.initialize = function()
    {
        $ecardBuilder  = $( ".ecardBuilder" );
        $ecardViewport = $( ".ecardViewport" );
        $ecardCanvas   = $( ".ecardCanvas" );
        
        // Set the viewport's dimensions.
        //
        canvasWidth  = theApp.settings.viewportWidth;
        canvasHeight = theApp.settings.viewportHeight;

        $ecardViewport.css( { width : canvasWidth, height : canvasHeight } );

        // Create and add Canvas.
        //
        $canvas = $( "<canvas></canvas>" );
        $canvas.attr( "width", canvasWidth );
        $canvas.attr( "height", canvasHeight );    
        $ecardCanvas.html( $canvas );

        context = $canvas[0].getContext( "2d" );

        // Listen to global app events.
        //
        $ecardBuilder.bind( "layerUpdate", canvasBuildLayers );
        $ecardBuilder.bind( "layerSelect", canvasBuildLayers );
        $ecardBuilder.bind( "layerVisibility", canvasBuildLayers );
        $ecardBuilder.bind( "layerRemove", canvasBuildLayers );

        // Setup the element resizer.
        //
        $ecardViewport.elementResize({
            "resizeCallback" : canvasLayerResize
        });

        // Do we have any layers allready?
        //
        canvasBuildLayers();
    };

    function canvasBuildLayers()
    {
        var layersObject = theApp.toolbar.layers && theApp.toolbar.layers.getAllLayers() || {}
        ,   layerCurrent = false
        ;

        context.clearRect( 0, 0, canvasWidth, canvasHeight );

        $.each( layersObject.layers || [], function( index, layer )
        {
            if( layer.selected )
            {
                layerCurrent = layer;
            }

            canvasLayerCreate( false, layer );
        });

        if( layerCurrent && layerCurrent.visible )
        {
            context.save();

            context.translate( layerCurrent.position.x + ( layerCurrent.sizeCurrent.width / 2 ), layerCurrent.position.y + ( layerCurrent.sizeCurrent.height / 2 ) );
            context.rotate( utils.toRadians( layerCurrent.rotation ) );
            context.translate( -( layerCurrent.position.x + ( layerCurrent.sizeCurrent.width / 2 ) ), -( layerCurrent.position.y + (layerCurrent.sizeCurrent.height / 2 ) ) );           
            context.strokeStyle = "#666";
            context.lineWidth = 2;
            context.strokeRect( layerCurrent.position.x, layerCurrent.position.y, layerCurrent.sizeCurrent.width, layerCurrent.sizeCurrent.height ); 
    
            context.restore();

            $ecardViewport.trigger( "positionElementResize", [ layerCurrent.positionRotated, layerCurrent.sizeRotated ] );
        }

        $ecardViewport.trigger( "visibilityElementResize", [ layerCurrent.visible ] );
    }

    function canvasLayerCreate( event, layer )
    {
        context.save();

        if( layer.visible && "image" === layer.type )
        {
            context.translate( layer.position.x + ( layer.sizeCurrent.width / 2 ), layer.position.y + ( layer.sizeCurrent.height / 2 ) );
            context.rotate( utils.toRadians( layer.rotation ) );
            context.translate( -( layer.position.x + ( layer.sizeCurrent.width / 2 ) ), -( layer.position.y + (layer.sizeCurrent.height / 2 ) ) );
            context.drawImage( layer.image, layer.position.x, layer.position.y, layer.sizeCurrent.width, layer.sizeCurrent.height );
        }

        context.restore();
    }

    function canvasLayerResize( delta, direction )
    {
        $ecardBuilder.trigger( "layerResize", [ delta, direction ] );
    }

} )( jQuery, window, "ecardBuilder" );