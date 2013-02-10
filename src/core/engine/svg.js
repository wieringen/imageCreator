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
    ,   htmlParagraphCurrent
    ,   svgSelect
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
        svgContainer.setAttribute( "version", "1.2");
        svgContainer.setAttribute( "baseProfile", "tiny" );
        
        $( svgContainer ).css( { width : canvasWidth, height : canvasHeight } );

        $imageCreatorCanvas.html( svgContainer );

        // Create a selection rectangle to put around selected layers.
        //
        svgSelect = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );
        svgSelect.setAttribute( "style", "fill: transparent; stroke-dasharray: 5,5; stroke:#666; stroke-width:2;" );
        svgSelect.setAttribute( "vector-effect", "non-scaling-stroke" );
        svgSelect.setAttribute( "id", "svgselect" );

        // Create cool SMIL animtion to give some more flair to the selection.
        //
        svgSelectAnimate = document.createElementNS( "http://www.w3.org/2000/svg", "animate" );
        svgSelectAnimate.setAttribute( "attributeName", "stroke-dashoffset" );
        svgSelectAnimate.setAttribute( "attributeType", "XML" );
        svgSelectAnimate.setAttribute( "from", "5" );
        svgSelectAnimate.setAttribute( "to", "10" );
        svgSelectAnimate.setAttribute( "dur", "0.4s" );
        svgSelectAnimate.setAttribute( "repeatCount", "indefinite" );
        svgSelect.appendChild( svgSelectAnimate );

        // Remove other engines that may be listening.
        //
        $imageCreatorViewport.unbind( ".engine" );

        // Listen to global app events.
        //
        $imageCreatorViewport.bind( "layerUpdate.engine" , svgLayerCheck );
        $imageCreatorViewport.bind( "layerSelect.engine", svgLayerSelect );
        $imageCreatorViewport.bind( "layerVisibility.engine", svgLayerVisibility );
        $imageCreatorViewport.bind( "layerRemove.engine", svgLayerRemove );
        $imageCreatorViewport.bind( "layersRedraw.engine", svgBuildLayers );

        // Do we have any layers allready?
        //
        svgBuildLayers();
    };

    function svgBuildLayers()
    {
        // Remove all svg children if there are any
        //
        $( svgContainer ).find( "image" ).remove();
        $( svgContainer.getElementsByTagName( "foreignObject" ) ).remove();

        //$( svgContainer ).find( "text, image" ).remove();

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
            svgLayerCreate( false, layer );
        }

        // Update layer properties
        //
        svgLayerUpdate( false, layer );

        // Set the selection rectangle around the current layer.
        //
        if( layer.selected )
        {
            svgLayerSelect( false, layer );
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
            
            svgLayerCurrent.setAttribute( "width", layer.sizeReal.width );  
            svgLayerCurrent.setAttribute( "height", layer.sizeReal.height );
        }

        if( "text" === layer.type )
        {
            //svgLayerCurrent = document.createElementNS( "http://www.w3.org/2000/svg", "text" );

            svgLayerCurrent      = document.createElementNS( "http://www.w3.org/2000/svg", "foreignObject" );
            htmlParagraphCurrent = document.createElement( "p" );
            svgLayerCurrent.appendChild( htmlParagraphCurrent );
        }

        svgLayerCurrent.setAttribute( "id", layer.id + module.name );
        
        if( ! layer.locked && config.options.toolbar.layers && config.options.toolbar.layers.autoSelectLayer )
        {
            $( svgLayerCurrent ).bind( "tap", svgLayerTapSelect );
        }

        // Append new layer to DOM and reappend the selection layer so its always on top.
        //
        $( svgContainer ).append( svgSelect );  
        $( svgContainer ).append( svgLayerCurrent );
    }

    function svgLayerUpdate( event, layer )
    {
        // Set type specific attributes.
        // 
        if( "text" === layer.type )
        {
            htmlParagraphCurrent = $( svgLayerCurrent ).find( "p" );
            
            var buildTextString = "";

            $.each( layer.textLines, function( index, line )
            {
                buildTextString += line + "</br>";
            });

            htmlParagraphCurrent.html( buildTextString );

            htmlParagraphCurrent.css(
            {   
                color      : layer.color
            ,   fontSize   : layer.fontSize
            ,   fontFamily : layer.font
            ,   fontWeight : layer.weight ? "bold" : "normal"
            ,   fontStyle  : layer.style ? "italic" : "normal"
            });

            /* Doesn't work on ipad but is preferred method need to test.

            $( svgLayerCurrent ).find( "tspan" ).remove();

            $.each( layer.textLines, function( index, line )
            {
                var tspannode = document.createElementNS( "http://www.w3.org/2000/svg", "tspan" )
                ,   textnode  = document.createTextNode( line )
                ;
                
                tspannode.setAttribute( "x", "5px" );
                tspannode.setAttribute( "y", "0.95em");
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
            });*/

            svgLayerCurrent.setAttribute( "height", layer.sizeCurrent.height );
            svgLayerCurrent.setAttribute( 'width', layer.sizeCurrent.width );
        }

        // Set attributes.
        //  
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
        if( event.type !== "layerUpdate" )
        {
            svgSelect.setAttribute( "visibility", layer.visible ? "visible" : "hidden" );

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
        var $svgLayerToRemove = $( "#" + layer.id + module.name );

        // Remove layer from DOM.
        //
        $svgLayerToRemove.remove();
        
        // We only want to hide the selection layer if its around the currently selected layer.
        //
        if( layer.selected )
        {
            svgSelect.setAttribute( "visibility", "hidden" );
        }
    }

    function svgLayerTapSelect( event )
    {
        $imageCreatorViewport.trigger( "layerSelectByID", [ event.target.id.replace( module.name, "" ) ] );
    }

    return module;
});