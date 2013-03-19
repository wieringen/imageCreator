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
    ,   subs = [];
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

        // Listen to global app events.
        //
        $.pubsub( "subscribe", "layerUpdate", canvasBuildLayers );
        $.pubsub( "subscribe", "layerSelect", canvasBuildLayers );
        $.pubsub( "subscribe", "layerVisibility", canvasBuildLayers );
        $.pubsub( "subscribe", "layerRemove", canvasBuildLayers );
        $.pubsub( "subscribe", "layersRedraw", canvasBuildLayers );

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
        context.setTransform( layer.matrix[ 0 ], layer.matrix[ 3 ], layer.matrix[ 1 ], layer.matrix[ 4 ], layer.matrix[ 2 ], layer.matrix[ 5 ] );

        if( "image" === layer.type )
        {
            context.drawImage( layer.image, 0, 0, layer.sizeReal.width, layer.sizeReal.height );

            if( layer.filter.matrix )
            {
                context.putImageData( applyFilter( context, layer ), layer.positionRotated.x, layer.positionRotated.y);
            }
        }

        if( "text" === layer.type )
        {
            context.setTransform( layer.matrix[ 0 ], layer.matrix[ 3 ], layer.matrix[ 1 ], layer.matrix[ 4 ], layer.matrix[ 2 ], layer.matrix[ 5 ] );
            context.fillStyle    = layer.color;
            context.font         = ( layer.style ? "italic" : "normal" ) + " " + ( layer.weight ? "bold" : "normal" ) + " " + layer.fontSize + "px " + layer.font;
            context.textBaseline = 'top';

            var buildTextString = "";

            $.each( layer.textLines, function( index, line )
            {
                context.fillText( line, 5, Math.ceil( index * ( layer.fontSize * config.options.toolbar.text.textLineHeight ) ) );
            });
        }

        context.restore();
    }

    function canvasLayerSelect( event, layer )
    {
        context.save();
        
        context.setTransform( layer.matrix[ 0 ], layer.matrix[ 3 ], layer.matrix[ 1 ], layer.matrix[ 4 ], layer.matrix[ 2 ], layer.matrix[ 5 ] );
        context.strokeStyle = "#666";

        // We want a dashed line for our stroke. To bad that not all browsers support this.
        //
        if( context.setLineDash )
        {    
           context.setLineDash( [ 5 / layer.scale ] );
        }

        // The stroke must stay consistent in size so we need to cancel out the scaling effect.
        //
        context.lineWidth = 2 / layer.scale;

        context.strokeRect( 0, 0, ( layer.sizeReal ? layer.sizeReal.width : layer.sizeCurrent.width ), ( layer.sizeReal ? layer.sizeReal.height : layer.sizeCurrent.height ) ); 
        
        context.restore();
    }

    function applyFilter( context, layer ) 
    {
        var canvasData = context.getImageData( layer.positionRotated.x, layer.positionRotated.y, layer.sizeRotated.width, layer.sizeRotated.height )
        ,   len        = layer.sizeRotated.width * layer.sizeRotated.height * 4
        ;

        processFilter(canvasData.data, layer.filter, len);

        return canvasData;
     }

    function colorDistance( scale, dest, src ) 
    {
        return (scale * dest + (1 - scale) * src);
    };

    function processFilter( binaryData, filter, len ) 
    {
        var r, g, b
        ,   m         = filter.matrix
        ,   s         = filter.strength
        ,   m4        = m[4]  * 255
        ,   m9        = m[9]  * 255
        ,   m14       = m[14] * 255
        ,   m19       = m[19] * 255
        ;

        for (var i = 0; i < len; i += 4) 
        {
            r = binaryData[i];
            g = binaryData[i + 1];
            b = binaryData[i + 2];

            binaryData[i    ] = colorDistance(s, (r * m[0] ) + (g * m[1] ) + (b * m[2]), r) + m4;
            binaryData[i + 1] = colorDistance(s, (r * m[5] ) + (g * m[6] ) + (b * m[7]), g) + m9;
            binaryData[i + 2] = colorDistance(s, (r * m[10]) + (g * m[11]) + (b * m[12]), b) + m14;
        }
    };

    return module;
} );


