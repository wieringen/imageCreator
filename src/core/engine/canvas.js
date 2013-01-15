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
    // App core modules
    //
    "config"
,   "toolbar/layers"
],
function( config, layers )
{
    var module =
        {
            name     : "canvas"
        ,   options  : {}
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $canvas
    ,   $context

    ,   canvasWidth
    ,   canvasHeight
    ;

    module.initialize = function()
    {
        // Get basic app DOM elements.
        //        
        $imageCreatorViewport = $( ".imageCreatorViewport" );
        $imageCreatorCanvas   = $( ".imageCreatorCanvas" );
        
        // Set the viewport's dimensions.
        //
        canvasWidth  = config.options.viewportWidth;
        canvasHeight = config.options.viewportHeight;

        $imageCreatorViewport.css( { width : canvasWidth, height : canvasHeight } );

        // Create and add Canvas.
        //
        $canvas = $( "<canvas></canvas>" );
        $canvas.attr( "width", canvasWidth );
        $canvas.attr( "height", canvasHeight );    
        $imageCreatorCanvas.html( $canvas );

        context = $canvas[0].getContext( "2d" );

        // Remove other engines that may be listening.
        //
        $imageCreatorViewport.unbind( ".engine" );

        // Listen to global app events.
        //
        $imageCreatorViewport.bind( "layerUpdate.engine", canvasBuildLayers );
        $imageCreatorViewport.bind( "layerSelect.engine", canvasBuildLayers );
        $imageCreatorViewport.bind( "layerVisibility.engine", canvasBuildLayers );
        $imageCreatorViewport.bind( "layerRemove.engine", canvasBuildLayers );

        // Do we have any layers allready?
        //
        canvasBuildLayers();
    };

    function canvasBuildLayers()
    {
        var layersObject = layers && layers.getAllLayers() || {}
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
        context.lineWidth   = 2 / layer.scale;

        context.strokeRect( 0, 0, ( layer.sizeReal ? layer.sizeReal.width : layer.sizeCurrent.width ), ( layer.sizeReal ? layer.sizeReal.height : layer.sizeCurrent.height ) ); 
        
        context.restore();
    }

    return module;
} );