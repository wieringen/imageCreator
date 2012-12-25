/**
 * @description <p>The Canvas engine implementation.</p>
 *
 * @namespace imageCreator.engine
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
],
function( $, utils )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name        : "canvas"
        ,   settings    : 
            {
            }
        }

    ,   $imageCreator
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
        $imageCreator  = $( ".imageCreator" );
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

        // Remove other engines that may be listening.
        //
        $imageCreator.unbind( ".engine" );

        // Listen to global app events.
        //
        $imageCreator.bind( "layerUpdate.engine", canvasBuildLayers );
        $imageCreator.bind( "layerSelect.engine", canvasBuildLayers );
        $imageCreator.bind( "layerVisibility.engine", canvasBuildLayers );
        $imageCreator.bind( "layerRemove.engine", canvasBuildLayers );

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
    }

    function canvasLayerCreate( event, layer )
    {
        context.save();

        if( "image" === layer.type )
        {   
            context.setTransform( layer.matrix[ 0 ], layer.matrix[ 3 ], layer.matrix[ 1 ], layer.matrix[ 4 ], layer.matrix[ 2 ], layer.matrix[ 5 ] );
            context.drawImage( layer.image, 0, 0, layer.sizeReal.width, layer.sizeReal.height );
        }

        context.restore();
    }

    function canvasLayerSelect( event, layer )
    {
        context.save();
        
        context.setTransform( layer.matrix[ 0 ], layer.matrix[ 3 ], layer.matrix[ 1 ], layer.matrix[ 4 ], layer.matrix[ 2 ], layer.matrix[ 5 ] );
        context.strokeStyle = "#666";
        context.lineWidth = 2 / layer.scale;

        context.strokeRect( 0, 0, ( layer.sizeReal ? layer.sizeReal.width : layer.sizeCurrent.width ), ( layer.sizeReal ? layer.sizeReal.height : layer.sizeCurrent.height ) ); 
        
        context.restore();
    }

    return module;
} );