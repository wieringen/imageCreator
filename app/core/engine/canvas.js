/**
 * @description <p>The Canvas engine implementation.</p>
 *
 * @namespace ecardBuilder.engine
 * @name canvas
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery"

    // App core modules.
    //
,   "utils"

    // jQuery plugins
    //
,   "plugins/jquery.elementResize"
],
function( $, utils )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name        : "canvas"
        ,   initialized : false
        ,   settings    : 
            {
            }
        }

    ,   $ecardBuilder
    ,   $ecardViewport
    ,   $canvas
    ,   $context

    ,   canvasWidth
    ,   canvasHeight
    ;

    module.initialize = function()
    {
        // Get basic app DOM elements.
        //        
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
        if( ! module.initialized )
        {        
            $ecardBuilder.bind( "layerUpdate", canvasBuildLayers );
            $ecardBuilder.bind( "layerSelect", canvasBuildLayers );
            $ecardBuilder.bind( "layerVisibility", canvasBuildLayers );
            $ecardBuilder.bind( "layerRemove", canvasBuildLayers );
        }

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

        // Empty canvas.
        //
        context.clearRect( 0, 0, canvasWidth, canvasHeight );

        // Draw all the layers.
        //
        $.each( layersObject.layers || [], function( index, layer )
        {
            // Store reference to selected layer in memory.
            //
            if( layer.selected )
            {
                layerCurrent = layer;
            }

            // If layer is visible than draw it.
            //
            if( layer.visible )
            {
                canvasLayerCreate( false, layer );
            }
        });

        // Set the selection rectangle around the current layer.
        //
        if( layerCurrent && layerCurrent.visible )
        {
            canvasLayerSelect( false, layerCurrent );
        }

        $ecardViewport.trigger( "visibilityElementResize", [ layerCurrent.visible ] );
    }

    function canvasLayerCreate( event, layer )
    {
        context.save();

        if( "image" === layer.type )
        {
            context.translate( layer.position.x + ( layer.sizeCurrent.width / 2 ), layer.position.y + ( layer.sizeCurrent.height / 2 ) );
            context.rotate( layer.rotation.radians );
            context.translate( -( layer.position.x + ( layer.sizeCurrent.width / 2 ) ), -( layer.position.y + (layer.sizeCurrent.height / 2 ) ) );
            context.drawImage( layer.image, layer.position.x, layer.position.y, layer.sizeCurrent.width, layer.sizeCurrent.height );
        }

        context.restore();
    }

    function canvasLayerSelect( event, layer )
    {
        context.save();

        context.translate( layer.position.x + ( layer.sizeCurrent.width / 2 ), layer.position.y + ( layer.sizeCurrent.height / 2 ) );
        context.rotate( layer.rotation.radians );
        context.translate( -( layer.position.x + ( layer.sizeCurrent.width / 2 ) ), -( layer.position.y + (layer.sizeCurrent.height / 2 ) ) );           
        context.strokeStyle = "#666";
        context.lineWidth = 2;
        context.strokeRect( layer.position.x, layer.position.y, layer.sizeCurrent.width, layer.sizeCurrent.height ); 

        context.restore();

        $ecardViewport.trigger( "positionElementResize", [ layer.positionRotated, layer.sizeRotated ] );
    }

    function canvasLayerResize( delta, direction )
    {
        $ecardBuilder.trigger( "layerResize", [ delta, direction ] );
    }

    return module;
} );