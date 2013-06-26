/**
*
* @module engine.svg
*/

define(
[
    // Template.
    //
    "text!templates/svg.html"

    // App core modules
    //
,   "config"
,   "cache"
],
function( moduleHTML, config, cache )
{
    var module =
        {
            name : "svg"
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas

    ,   svgContainer
    ,   svgDefs
    ,   svgSelect

    ,   canvasWidth
    ,   canvasHeight
    ;

    module.initialize = function()
    {
        // Get basic app DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );
        $imageCreatorCanvas   = $( ".imageCreatorCanvas" );

        // Append module HTML.
        //
        $imageCreatorCanvas.html( moduleHTML );

        // Get module DOM elements.
        //
        svgContainer = $imageCreatorCanvas.find( "svg" )[0];
        svgDefs      = $imageCreatorCanvas.find( "defs" )[0];
        svgSelect    = $imageCreatorCanvas.find( "rect" )[0];

        // Set the viewport's dimensions.
        //
        canvasWidth  = config.options.viewport.width;
        canvasHeight = config.options.viewport.height;

        svgContainer.setAttribute( "width", canvasWidth );
        svgContainer.setAttribute( "height", canvasHeight );

        $imageCreatorViewport.css( { width : canvasWidth, height : canvasHeight } );

        // Remove other engines that may be listening.
        //
        $.unsubscribe( ".engine" );

        // Listen to global app events.
        //
        $.subscribe( "layerUpdate.engine", svgLayerCheck );
        $.subscribe( "layerSelect.engine", svgLayerCheck );
        $.subscribe( "layerVisibility.engine", svgLayerVisibility );
        $.subscribe( "layerRemove.engine", svgLayerRemove );
        $.subscribe( "layersRedraw.engine", svgBuildLayers );

        // Get module snippets.
        //
        module.snippets.svgFilter = $( svgDefs ).find( "filter" )[0];

        // Do we have any layers allready?
        //
        svgBuildLayers();
    };

    function svgBuildLayers()
    {
        $( svgContainer ).find( "text, filter, image" ).remove();

        $.each( cache.getLayers(), function( index, layer)
        {
            var eventType = layer.selected ? "layerSelect" : "layerUpdate";

            svgLayerCheck( { type : eventType }, layer );
        });
    }

    function svgLayerCheck( event, layer, partial )
    {
        if( layer )
        {
            // If we dont have a layer in the dom its new so create it.
            //
            if( 0 === $( "#" + layer.id + module.name ).length )
            {
                svgLayerCreate( event, layer );
            }

            // Update layer properties
            //
            svgLayerUpdate( event, layer, partial );
        }

        // Set the selection rectangle around the current layer or hide it.
        //
        svgLayerSelect( event, layer );
    }

    function svgLayerCreate( event, layer )
    {
        var svgLayerCurrent, svgLayerFilter, svgLayerFilterColorMatrix, svgLayerFilterComposite;

        // Create DOM object from layer object.
        //
        if( "image" === layer.type )
        {
            svgLayerCurrent = document.createElementNS( "http://www.w3.org/2000/svg", "image" );
            svgLayerCurrent.setAttributeNS( "http://www.w3.org/1999/xlink", "href", layer.image.src );
            svgLayerCurrent.setAttribute( "filter", "url(#" + layer.id + "filter)" );

            svgLayerFilter = $( module.snippets.svgFilter ).clone();
            svgLayerFilter.attr( "id", layer.id + "filter" );

            svgLayerFilterColorMatrix = svgLayerFilter.find( "feColorMatrix" )[0];
            svgLayerFilterColorMatrix.setAttribute( "result", layer.id + "result"  );

            svgLayerFilterComposite = svgLayerFilter.find( "feComposite" )[0];
            svgLayerFilterComposite.setAttribute( "in", layer.id + "result" );

            svgDefs.appendChild( svgLayerFilter[0] );

            svgLayerCurrent.setAttribute( "width", layer.sizeReal.width );
            svgLayerCurrent.setAttribute( "height", layer.sizeReal.height );
        }

        if( "text" === layer.type )
        {
            svgLayerCurrent = document.createElementNS( "http://www.w3.org/2000/svg", "text" );
        }

        svgLayerCurrent.setAttribute( "id", layer.id + module.name );

        // Append new layer to DOM and reappend the selection layer so its always on top.
        //
        svgContainer.appendChild( svgLayerCurrent );
        svgContainer.appendChild( svgSelect );
    }

    function svgLayerUpdate( event, layer, partial )
    {
        var svgLayerCurrent = $( "#" + layer.id + module.name )[0]
        ,   svgLayerFilterColorMatrix
        ,   svgLayerFilterComposite
        ,   domFragment
        ;

        // Set type specific attributes.
        //
        if( "text" === layer.type && ! partial )
        {
            $( svgLayerCurrent ).find( "tspan" ).remove();

            svgLayerCurrent.setAttribute( "height", layer.sizeCurrent.height );
            svgLayerCurrent.setAttribute( "width", layer.sizeCurrent.width );

            var textAnchorMap =
                {
                    "left"   : "start"
                ,   "center" : "middle"
                ,   "right"  : "end"
                }
            ,   textAlignPositionMap =
                {
                    "start"  : 0
                ,   "middle" : 0.5
                ,   "end"    : 1
            };

            $( svgLayerCurrent ).css(
            {
                fill       : layer.color
            ,   fontSize   : layer.fontSize
            ,   fontFamily : layer.font
            ,   fontWeight : layer.weight ? "bold" : "normal"
            ,   fontStyle  : layer.style ? "italic" : "normal"
            ,   textAnchor : textAnchorMap[ layer.textAlign ]
            });

            domFragment = document.createDocumentFragment();

            $.each( layer.textLines, function( index, line )
            {
                var tspannode = document.createElementNS( "http://www.w3.org/2000/svg", "tspan" );

                // IE9 doesn't support this so i will have to make a hack in this browser to presere whitespace :(
                //
                tspannode.setAttributeNS( "http://www.w3.org/XML/1998/namespace", "xml:space", "preserve" );

                tspannode.setAttribute( "x", 0 );
                tspannode.setAttribute( "y", 0 );

                tspannode.setAttribute( "dx", layer.sizeCurrent.width * textAlignPositionMap[ textAnchorMap[ layer.textAlign ] ] );
                tspannode.setAttribute( "dy", ( index * Math.floor( layer.fontSize * layer.lineHeight ) ) + layer.fontSize + "px" );

                tspannode.textContent = line;

                domFragment.appendChild(tspannode);
            });

            svgLayerCurrent.appendChild(domFragment);
        }

        if( "image" === layer.type && ! partial )
        {
            svgLayerFilterColorMatrix = $( "#" + layer.id + "filter" ).find( "feColorMatrix" )[0];

            if( layer.filter.matrix )
            {
                svgLayerFilterColorMatrix.setAttribute( "values", layer.filter.matrix.join(" ") );

                svgLayerFilterComposite = $( "#" + layer.id + "filter" ).find( "feComposite" )[0];
                svgLayerFilterComposite.setAttribute( "k2", layer.filter.strength );
                svgLayerFilterComposite.setAttribute( "k3", 1 - layer.filter.strength );
            }
            else
            {
                svgLayerFilterColorMatrix.removeAttribute( "values" );
            }
        }

        svgLayerCurrent.setAttribute( "visibility", layer.visible ? "visible" : "hidden" );
        svgLayerCurrent.setAttribute( "transform", 'matrix(' + layer.matrix[ 0 ] + ',' + layer.matrix[ 3 ] + ',' + layer.matrix[ 1 ] + ',' + layer.matrix[ 4 ] + ',' + layer.matrix[ 2 ] + ',' + layer.matrix[ 5 ] + ')' );
    }

    function svgLayerSelect( event, layer )
    {
        // If we have a layer change selection properties to match its dimensions.
        //
        if( layer && layer.selected )
        {
            svgSelect.setAttribute( "transform", 'matrix(' + layer.matrix[ 0 ] + ',' + layer.matrix[ 3 ] + ',' + layer.matrix[ 1 ] + ',' + layer.matrix[ 4 ] + ',' + layer.matrix[ 2 ] + ',' + layer.matrix[ 5 ] + ')' );

            if( "text" === layer.type )
            {
                svgSelect.setAttribute( "height", layer.sizeCurrent.height );
                svgSelect.setAttribute( "width",  layer.sizeCurrent.width );
            }

            if( layer.locked )
            {
                svgSelect.setAttribute( "visibility", "hidden" );

                return false;
            }
        }

        // If we have no layer to select or if its hidden hide the selection rectangle as well.
        //
        if( event.type !== "layerUpdate" )
        {
            svgSelect.setAttribute( "visibility", layer.visible && layer.selected ? "visible" : "hidden" );

            // When the layer is a image set the selection to match the image its real size so we can reuse the image projection matrix.
            // Text layers dont need this because text is not scaled.
            // Since these values never change for the sake of performance we want to set this on layer selection rather then layer update.
            //
            if( "image" === layer.type )
            {
                svgSelect.setAttribute( "height", layer.sizeReal.height );
                svgSelect.setAttribute( "width", layer.sizeReal.width );
            }
        }
    }

    function svgLayerVisibility( event, layer )
    {
       $( "#" + layer.id + module.name ).attr( "visibility", layer.visible ? "visible" : "hidden" );

        // We only want to toggle the selection layer if its around the currently selected layer.
        //
        if( layer.selected )
        {
            svgSelect.setAttribute( "visibility", layer.visible ? "visible" : "hidden" );
        }
    }

    function svgLayerRemove( event, layerId )
    {
        $( "#" + layerId + module.name ).remove();
        $( "#" + layerId + "filter" ).remove();
    }

    return module;
});