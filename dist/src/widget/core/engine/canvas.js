/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
 ;( function( $, context, appName )
 {

    var theApp = $.getAndCreateContext( appName, context )
    ,   utils  = $.getAndCreateContext( "utils", theApp )
    ,   canvas = {}

    ,   $ecardBuilder
    ,   $ecardViewport
    ,   $canvas
    ,   $context

    ,   canvasWidth
    ,   canvasHeight
    ;

    canvas.name = "canvas";

    theApp.engine = canvas;

    canvas.initialize = function()
    {
        $ecardBuilder  = $( ".ecardBuilder" );
        $ecardViewport = $( ".ecardViewport" );

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
        $ecardViewport.html( $canvas );

        context = $canvas[0].getContext( "2d" );

        // Listen to global app events.
        //
        $ecardBuilder.bind( "layerUpdate", canvasBuildLayers );
        $ecardBuilder.bind( "layerSelect", canvasBuildLayers );
        $ecardBuilder.bind( "layerVisibility", canvasBuildLayers );
        $ecardBuilder.bind( "layerRemove", canvasBuildLayers );

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

            context.save();

            context.translate( layerCurrent.position.x + ( layerCurrent.sizeCurrent.width / 2 ), layerCurrent.position.y + ( layerCurrent.sizeCurrent.height / 2 ) );
            context.translate( -( layerCurrent.position.x + ( layerCurrent.sizeCurrent.width / 2 ) ), -( layerCurrent.position.y + (layerCurrent.sizeCurrent.height / 2 ) ) );           
            context.strokeStyle = "#ccc";
            context.lineWidth = 1;
            context.strokeRect( layerCurrent.positionRotated.x, layerCurrent.positionRotated.y, layerCurrent.sizeRotated.width, layerCurrent.sizeRotated.height ); 
    
            context.restore();

        }

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


} )( jQuery, window, "ecardBuilder" );