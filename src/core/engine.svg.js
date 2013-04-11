/**
 * @description <p>The SVG engine implementation.</p>
 *
 * @namespace imageCreator.engine
 * @name svg
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // App core modules
    //
    "config"
,   "cache"
],
function( config, cache )
{
    var module =
        {
            name : "svg"
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas 
    ,   svgContainer

    ,   svgSelect
    ,   svgDefs
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

        // Create and add SVG container.
        //
        svgContainer = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
        svgContainer.setAttribute( "version", "1.2");
        svgContainer.setAttribute( "baseProfile", "tiny" );
        svgContainer.setAttribute( "width", canvasWidth );
        svgContainer.setAttribute( "height", canvasHeight );

        $imageCreatorCanvas.html( svgContainer );

        // Create and add SVG Filters container.
        //
        svgDefs = document.createElementNS( "http://www.w3.org/2000/svg", "defs" );
        svgContainer.appendChild( svgDefs );

        // Marching ants ftw! Well in all sane browsers ie9 doesn't support this offcourse.
        //
        svgSelectAnimate = document.createElementNS( "http://www.w3.org/2000/svg", "animate" );
        //svgSelectAnimate.setAttributeNS( "http://www.w3.org/1999/xlink", "href", "#svgSelect" );
        svgSelectAnimate.setAttribute( "id", "marchingAnts" );
        svgSelectAnimate.setAttribute( "attributeName", "stroke-dashoffset" );
        svgSelectAnimate.setAttribute( "values", "10;0" );
        svgSelectAnimate.setAttribute( "dur", "0.4s" );
        svgSelectAnimate.setAttribute( "repeatCount", "indefinite" );
        svgDefs.appendChild( svgSelectAnimate );

        // Create a selection rectangle to put around selected layers.
        //
        svgSelect = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );
        svgSelect.setAttribute( "style", "fill: transparent; stroke-dasharray: 5,5; stroke-width: 1; stroke:#000000;" );

        // IE9 Doesn't support this attribute so i will have to make a hack in this browser to stop the stroke from scaling :(
        //
        svgSelect.setAttribute( "vector-effect", "non-scaling-stroke" );
        svgSelect.setAttribute( "id", "svgSelect" );

        // Create filter snippet.
        //
        module.snippets.svgFilter = document.createElementNS( "http://www.w3.org/2000/svg", "filter" );
        module.snippets.svgFilter.setAttribute( "color-interpolation-filters", "sRGB" );

        var svgFilterMatrix    = document.createElementNS( "http://www.w3.org/2000/svg", "feColorMatrix" );
        var svgFilterComposite = document.createElementNS( "http://www.w3.org/2000/svg", "feComposite" );
        
        svgFilterComposite.setAttribute( "in2", "SourceGraphic" );
        svgFilterComposite.setAttribute( "operator", "arithmetic" );
        svgFilterComposite.setAttribute( "k2", 0 );
        svgFilterComposite.setAttribute( "k3", 1 );

        module.snippets.svgFilter.appendChild( svgFilterMatrix );
        module.snippets.svgFilter.appendChild( svgFilterComposite );

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

        // Do we have any layers allready?
        //
        svgBuildLayers();
    };

    function svgBuildLayers()
    {
        $( svgContainer ).find( "text, filter, image" ).remove();

        $.each( cache.getLayers(), svgLayerCheck );
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
        ;

        // Set type specific attributes.
        // 
        if( "text" === layer.type && ! partial )
        {
            $( svgLayerCurrent ).find( "tspan" ).remove();

            svgLayerCurrent.setAttribute( "height", layer.sizeCurrent.height );
            svgLayerCurrent.setAttribute( "width", layer.sizeCurrent.width );

            $.each( layer.textLines, function( index, line )
            {
                var tspannode = document.createElementNS( "http://www.w3.org/2000/svg", "tspan" );

                // IE9 doesn't support this so i will have to make a hack in this browser to presere whitespace :(
                //
                tspannode.setAttributeNS( "http://www.w3.org/XML/1998/namespace", "xml:space", "preserve" );

                tspannode.setAttribute( "x", 0 );
                tspannode.setAttribute( "y", Math.floor( layer.fontSize ) + "px" );

                tspannode.setAttribute( "dx", 0 );
                tspannode.setAttribute( "dy", index * Math.floor( layer.fontSize * layer.lineHeight )  + "px" );

                tspannode.textContent = line;                     
                svgLayerCurrent.appendChild(tspannode);
            });

            $( svgLayerCurrent ).css(
            {   
                fill       : layer.color
            ,   fontSize   : layer.fontSize
            ,   fontFamily : layer.font
            ,   fontWeight : layer.weight ? "bold" : "normal"
            ,   fontStyle  : layer.style ? "italic" : "normal"
            });
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
            svgSelect.setAttribute( "visibility", layer.visible ? "visible" : "hidden" );

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