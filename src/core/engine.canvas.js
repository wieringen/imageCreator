/**
*
* @module engine.canvas
*/
define(
[
    // App core modules
    //
    "config"
,   "cache"
,   "cs!util.math"
],
function( config, cache, utilMath )
{
    var module =
        {
            name    : "canvas"
        ,   options : config.options.engines
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas

    ,   canvas
    ,   context

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
        canvasWidth  = config.options.viewport.width;
        canvasHeight = config.options.viewport.height;

        $imageCreatorViewport.css( { width : canvasWidth, height : canvasHeight } );

        // Create and add Canvas.
        //
        canvas  = document.createElement( "canvas" );
        context = canvas.getContext( "2d" );

        canvas.setAttribute( "width", canvasWidth );
        canvas.setAttribute( "height", canvasHeight );

        $imageCreatorCanvas.html( canvas );

        // Remove other engines that may be listening.
        //
        $.unsubscribe( ".engine" );

        // Listen to global app events.
        //
        $.subscribe( "layerUpdate.engine", canvasBuildLayers );
        $.subscribe( "layerSelect.engine", canvasBuildLayers );
        $.subscribe( "layerVisibility.engine", canvasBuildLayers );
        $.subscribe( "layerRemove.engine", canvasBuildLayers );
        $.subscribe( "layersRedraw.engine", canvasBuildLayers );

        // Do we have any layers allready?
        //
        canvasBuildLayers();
    };

    function canvasBuildLayers( event )
    {
        var layers       = cache.getLayers()
        ,   layerCurrent = cache.getLayerActive()
        ;

        // Empty canvas.
        //
        context.clearRect( 0, 0, canvasWidth, canvasHeight );

        // Draw all the layers.
        //
        $.each( layers, function( index, layer )
        {
            // If layer is visible than draw it.
            //
            if( layer.visible )
            {
                canvasLayerCreate( event, layer );
            }
        });

        // Set the selection rectangle around the current layer.
        //
        if( layerCurrent && layerCurrent.visible )
        {
            canvasLayerSelect( event, layerCurrent );
        }
    }

    function canvasLayerCreate( event, layer )
    {
        // Save the current state ( matrix, clipping, etc ).
        //
        context.save();

        // Change the matrix state of the canvas so it reflects the new layer we want to create.
        //
        context.setTransform( layer.matrix[ 0 ], layer.matrix[ 3 ], layer.matrix[ 1 ], layer.matrix[ 4 ], layer.matrix[ 2 ], layer.matrix[ 5 ] );

        // Create the actual layer.
        //
        if( "image" === layer.type )
        {
            if( event && event.type === "layerSelect" )
            {
                layer.setImageManipulated( null );
            }

            // Draw the image and use its real size the matrix applied above will do the scaling for us.
            //
            context.drawImage( getImage( context, layer ), 0, 0, layer.sizeReal.width, layer.sizeReal.height );
        }

        if( "text" === layer.type )
        {
            context.fillStyle    = layer.color;
            context.font         = ( layer.style ? "italic" : "normal" ) + " " + ( layer.weight ? "bold" : "normal" ) + " " + layer.fontSize + "px " + layer.font;
            context.textAlign    = layer.textAlign;

            // We have to create a seperate container for every text line.
            //
            $.each( layer.textLines, function( index, line )
            {
                context.fillText(
                    // Text line
                    //
                    line

                    // Left
                    //
                ,   layer.sizeCurrent.width * { "left" : 0, "center" : 0.5, "right" : 1 }[ layer.textAlign ]

                    // Top
                    //
                ,   ( index * Math.floor( layer.fontSize * layer.lineHeight ) ) + layer.fontSize
                );
            });
        }

        // Restore the state of the canvas to the saved state.
        //
        context.restore();
    }

    function canvasLayerSelect( event, layer )
    {
        // Save the current state ( matrix, clipping, etc ).
        //
        context.save();

        // Change the matrix state of the canvas so it reflects the selection.
        //
        context.setTransform( layer.matrix[ 0 ], layer.matrix[ 3 ], layer.matrix[ 1 ], layer.matrix[ 4 ], layer.matrix[ 2 ], layer.matrix[ 5 ] );

        // Set the color of the selection
        //
        context.strokeStyle = module.options.selectionColor;

        // We want a dashed line for our stroke. To bad that not all browsers support this so we have to check can use it.
        //
        if( context.setLineDash )
        {
           context.setLineDash( [ module.options.selectionDash / layer.scale ] );
        }

        // The stroke must stay consistent in size so we need to cancel out the scaling effect.
        //
        context.lineWidth = 1 / layer.scale;

        // Create the actual selection the size is either based on the actual normal image size or in case of text on the actual container size.
        //
        context.strokeRect( 0, 0, ( layer.sizeReal ? layer.sizeReal.width : layer.sizeCurrent.width ), ( layer.sizeReal ? layer.sizeReal.height : layer.sizeCurrent.height ) );

        // Restore the state of the canvas to the saved state.
        //
        context.restore();
    }

    function getImage( context, layer )
    {
        // No filter or mask defined return normal image.
        //
        if( ! layer.filter.matrix && layer.mask.name === "None")
        {
            return layer.image;
        }
        else
        {
            // Do we allready have a image processed with a filter in mem? Use that.
            //
            if( layer.imageManipulated )
            {
                return layer.imageManipulated;
            }
            // If we have nothing in memory create one.
            //
            else
            {
                layer.setImageManipulated( applyImageManipulations(  layer ) );

                return layer.imageManipulated;
            }
        }
    }

    function applyImageManipulations( layer )
    {
        var copyCanvas  = document.createElement( "canvas" )
        ,   copyContext = copyCanvas.getContext( "2d" )
        ,   canvasData
        ,   canvasDataLength
        ;

        // Set the copy canvas to reflect the layer size.
        //
        copyCanvas.setAttribute( "width", layer.sizeReal.width );
        copyCanvas.setAttribute( "height", layer.sizeReal.height );

        if( layer.mask.name !== "None" )
        {
            if( layer.selected )
            {
                copyContext.save();

                copyContext.globalAlpha = 0.5;
                copyContext.drawImage( layer.image, 0, 0, layer.sizeReal.width, layer.sizeReal.height );
                copyContext.fillStyle = '#666';
                copyContext.fillRect(0, 0, layer.sizeReal.width, layer.sizeReal.height);

                copyContext.restore();
            }

            var clearCircle = function(x, y, radius)
            {
                copyContext.beginPath();
                copyContext.arc(x, y, radius, 0, 2 * Math.PI, false);
                copyContext.clip();
                copyContext.clearRect(x - radius - 1, y - radius - 1, radius * 2 + 2, radius * 2 + 2);
            };

            var radius = layer.sizeReal.width > layer.sizeReal.height ? layer.sizeReal.height : layer.sizeReal.width;//

            clearCircle( layer.sizeReal.width / 2, layer.sizeReal.height / 2, radius / 2);
        }

        // Draw the layer to the canvas
        //
        copyContext.drawImage( layer.image, 0, 0, layer.sizeReal.width, layer.sizeReal.height );

        if( layer.filter.matrix  )
        {
            // Get the pixel data from the canvas
            //
            canvasData = copyContext.getImageData( 0, 0, layer.sizeReal.width, layer.sizeReal.height );

            // We need the total length of the pixel data.
            //
            canvasDataLength = layer.sizeReal.width * layer.sizeReal.height * 4;

            // Add a filter to the pixel data.
            //
            processColorFilter( canvasData.data, layer.filter, canvasDataLength );

            // Put back the processed image in the copy canvas.
            //
            copyContext.putImageData( canvasData, 0, 0 );
        }

        return copyCanvas;
     }

    function colorDistance( scale, dest, src )
    {
        return (scale * dest + (1 - scale) * src);
    }

    function processColorFilter( binaryData, filter, len )
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
    }

    return module;
} );