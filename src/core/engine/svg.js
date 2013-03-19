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
,   "toolbar/layers"
],
function( config, layers )
{
    var module =
        {
            name     : "svg"
        ,   options  : {}
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas 
    ,   svgContainer

    ,   canvasWidth
    ,   canvasHeight

    ,   svgLayerCurrent
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
        canvasWidth  = config.options.viewportWidth;
        canvasHeight = config.options.viewportHeight;

        $imageCreatorViewport.css( { width : canvasWidth, height : canvasHeight } );

        // Create and add SVG container.
        //
        svgContainer = document.createElementNS( "http://www.w3.org/2000/svg", "svg" );
        svgDefs      = document.createElementNS( "http://www.w3.org/2000/svg", "defs" );
        svgContainer.setAttribute( "version", "1.2");
        svgContainer.setAttribute( "baseProfile", "tiny" );
        svgContainer.appendChild( svgDefs );

        $( svgContainer ).css( { width : canvasWidth, height : canvasHeight } );

        $imageCreatorCanvas.html( svgContainer );

        // Create a selection rectangle to put around selected layers.
        //
        svgSelect = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );
        svgSelect.setAttribute( "style", "fill: transparent; stroke-dasharray: 5,5; stroke:#666; stroke-width:2;" );
        svgSelect.setAttribute( "vector-effect", "non-scaling-stroke" );
        svgSelect.setAttribute( "id", "svgselect" );

        // Marching ants ftw!
        //
        svgSelectAnimate = document.createElementNS( "http://www.w3.org/2000/svg", "animate" );
        svgSelectAnimate.setAttribute( "attributeName", "stroke-dashoffset" );
        svgSelectAnimate.setAttribute( "values", "10;0" );
        svgSelectAnimate.setAttribute( "dur", "0.4s" );
        svgSelectAnimate.setAttribute( "repeatCount", "indefinite" );
        svgSelect.appendChild( svgSelectAnimate );

        // Create filter snippet.
        //
        module.snippets.svgFilter  = document.createElementNS( "http://www.w3.org/2000/svg", "filter" );
        module.snippets.svgFilter.setAttribute( "color-interpolation-filters", "sRGB" );

        var svgFilterMatrix        = document.createElementNS( "http://www.w3.org/2000/svg", "feColorMatrix" );
        var svgFilterComposite     = document.createElementNS( "http://www.w3.org/2000/svg", "feComposite" );
        
        svgFilterComposite.setAttribute( "in2", "SourceGraphic" );
        svgFilterComposite.setAttribute( "operator", "arithmetic" );
        svgFilterComposite.setAttribute( "k2", 0 );
        svgFilterComposite.setAttribute( "k3", 1 );

        module.snippets.svgFilter.appendChild( svgFilterMatrix );
        module.snippets.svgFilter.appendChild( svgFilterComposite );

        // Remove other engines that may be listening.
        //
        //$imageCreatorViewport.unbind( ".engine" );

        // Listen to global app events.
        //
        $.pubsub( "subscribe", "layerUpdate", svgLayerCheck );
        $.pubsub( "subscribe", "layerSelect", svgLayerSelect );
        $.pubsub( "subscribe", "layerVisibility", svgLayerVisibility );
        $.pubsub( "subscribe", "layerRemove", svgLayerRemove );
        $.pubsub( "subscribe", "layersRedraw", svgBuildLayers );

        // Set UI events.
        //
        $( svgContainer ).delegate( "image, text", "tap", svgLayerTapSelect );

        // Do we have any layers allready?
        //
        svgBuildLayers();
    };

    function svgBuildLayers()
    {
        // Remove all svg children if there are any
        //
        $( svgContainer ).find( "text, filter, image" ).remove();

        var layersObject = layers && layers.getAllLayers() || {};

        $.each( layersObject.layers || [], svgLayerCheck );
    }

    function svgLayerCheck( event, layer )
    {
        svgLayerCurrent = $( "#" + layer.id + module.name )[0];

        // If we dont have a layer in the dom its new so create it.
        //
        if( ! svgLayerCurrent )
        {
            svgLayerCreate( event, layer );
        }

        // Update layer properties
        //
        svgLayerUpdate( event, layer );

        // Set the selection rectangle around the current layer.
        //
        if( layer.selected )
        {
            svgLayerSelect( event, layer );
        }
    }

    function svgLayerCreate( event, layer )
    {
        // Create DOM object from layer object.
        //
        if( "image" === layer.type )
        {
            svgLayerCurrent = document.createElementNS( "http://www.w3.org/2000/svg", "image" );
            svgLayerCurrent.setAttributeNS( "http://www.w3.org/1999/xlink", "href", layer.image.src );
            
            svgLayerCurrent.setAttribute( "filter", "url(#" + layer.id + "filter)" );
            var svgLayerFilter = $( module.snippets.svgFilter ).clone();
            svgLayerFilter.attr( "id", layer.id + "filter" );

            svgLayerFilter.find( "feColorMatrix" )[0].setAttribute( "result", layer.id + "result"  );  
            var svgLayerFilterComposite = svgLayerFilter.find( "feComposite" )[0];
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
        $( svgContainer ).append( svgSelect );  
        $( svgContainer ).append( svgLayerCurrent );
    }

    function svgLayerUpdate( event, layer )
    {
        var isPartialUpdate = event.indexOf && event.indexOf( "partial" ) > -1;

        // Set type specific attributes.
        // 
        if( "text" === layer.type && ! isPartialUpdate )
        {
            $( svgLayerCurrent ).find( "tspan" ).remove();

            $.each( layer.textLines, function( index, line )
            {
                var tspannode = document.createElementNS( "http://www.w3.org/2000/svg", "tspan" )
                ,   textnode  = document.createTextNode( line )
                ;
                
                tspannode.setAttribute( "x", "5px" );
                tspannode.setAttribute( "y", "0.95em");

                tspannode.style.setProperty( "position", "absolute");
                tspannode.setAttribute( "dx", 0 );
                tspannode.setAttribute( "dy", Math.ceil( index * ( layer.fontSize * config.options.toolbar.text.textLineHeight ) )  );

                tspannode.appendChild(textnode);                       
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

            svgLayerCurrent.setAttribute( "height", layer.sizeCurrent.height );
            svgLayerCurrent.setAttribute( "width", layer.sizeCurrent.width );
        }

        if( "image" === layer.type && ! isPartialUpdate )
        {
            if( layer.filter.matrix )
            {
                $( "#" + layer.id + "filter" ).find( "feColorMatrix" )[0].setAttribute( "values", layer.filter.matrix.join( " " ) );
                var svgLayerFilterComposite = $( "#" + layer.id + "filter" ).find( "feComposite" )[0];

                svgLayerFilterComposite.setAttribute( "k2", layer.filter.strength );
                svgLayerFilterComposite.setAttribute( "k3", 1 - layer.filter.strength );
            }
            else
            {
                $( "#" + layer.id + "filter" ).find( "feColorMatrix" )[0].removeAttribute( "values" );
            }
        }

        svgLayerCurrent.setAttribute( "visibility", layer.visible ? "visible" : "hidden" );
        svgLayerCurrent.setAttribute( "transform", 'matrix(' + layer.matrix[ 0 ] + ',' + layer.matrix[ 3 ] + ',' + layer.matrix[ 1 ] + ',' + layer.matrix[ 4 ] + ',' + layer.matrix[ 2 ] + ',' + layer.matrix[ 5 ] + ')' );
    }

    function svgLayerSelect( event, layer )
    {
        svgLayerCurrent = $( "#" + layer.id + module.name )[0];

        // If we have a layer change selection properties to match its dimensions.
        //
        if( layer )
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
        if( event && event.indexOf( "layerUpdate" ) === -1 )
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
        var $svgLayerToToggle = $( "#" + layer.id + module.name );

        $svgLayerToToggle.attr( "visibility", layer.visible ? "visible" : "hidden" );

        // We only want to toggle the selection layer if its around the currently selected layer.
        //
        if( layer.selected )
        {
            svgSelect.setAttribute( "visibility", layer.visible ? "visible" : "hidden" );
        }
    }

    function svgLayerRemove( event, layer )
    {
        // Remove layer from DOM.
        //
        $( "#" + layer.id + module.name ).remove();
        $( "#" + layer.id + "filter" ).remove();

        // We only want to hide the selection layer if its around the currently selected layer.
        //
        if( layer.selected )
        {
            svgSelect.setAttribute( "visibility", "hidden" );
        }
    }

    function svgLayerTapSelect( event )
    {
        $.pubsub( "publish", "layerSelectByID", this.id.replace( module.name, "" ) );
    }

    return module;
});