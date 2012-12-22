/**
 * @description <p>The SVG engine implementation.</p>
 *
 * @namespace ecardBuilder.engine
 * @name SVG
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery"

    // jQuery plugins
    //
,   "plugins/jquery.elementResize"
],
function( $ )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name        : "svg"
        ,   initialized : false
        ,   settings    : 
            {
            }
        }

    ,   $ecardBuilder
    ,   $ecardViewport
    ,   $ecardCanvas 
    ,   svgContainer

    ,   svgSelect

    ,   svgLayerCurrent
    ,   htmlParagraphCurrent

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

        // Create and add SVG container.
        //
        svgContainer = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgContainer.setAttribute("version", "1.2");
        svgContainer.setAttribute("baseProfile", "tiny");
        
        $( svgContainer ).css( { width : canvasWidth, height : canvasHeight } );

        $ecardCanvas.html( svgContainer );

        // Create a selection rectangle to put around selected layers.
        //
        svgSelect = document.createElementNS( "http://www.w3.org/2000/svg", "rect" );
        svgSelect.setAttribute( "style", "fill: transparent; stroke-dasharray: 5,5; stroke:#666; stroke-width:2;");
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

        // Listen to global app events.
        //
        if( ! module.initialized )
        {
            $ecardBuilder.bind( "layerUpdate", svgLayerCheck );
            $ecardBuilder.bind( "layerSelect", svgLayerSelect );
            $ecardBuilder.bind( "layerVisibility", svgLayerVisibility );
            $ecardBuilder.bind( "layerRemove", svgLayerRemove );
        }
        
        // Setup the layer resizer.
        //
        $ecardViewport.elementResize({
            "resizeCallback" : svgLayerResize
        ,   "onRotate"       : function(){ return theApp.toolbar.layers.getCurrentLayer(); }
        });

        // Do we have any layers allready?
        //
        svgBuildLayers();
    };

    function svgBuildLayers()
    {
        var layersObject = theApp.toolbar.layers && theApp.toolbar.layers.getAllLayers() || {};

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
            svgLayerCurrent = document.createElementNS( "http://www.w3.org/2000/svg", "image");
            svgLayerCurrent.setAttributeNS('http://www.w3.org/1999/xlink','href',layer.image.src);
            
            svgLayerCurrent.setAttribute( 'width', layer.sizeReal.width );  
            svgLayerCurrent.setAttribute( 'height', layer.sizeReal.height );
        }

        if( "text" === layer.type )
        {
            svgLayerCurrent      = document.createElementNS( "http://www.w3.org/2000/svg", "foreignObject" );
            htmlParagraphCurrent = document.createElement( "p" );
            svgLayerCurrent.appendChild( htmlParagraphCurrent );
            
            svgLayerCurrent.setAttribute( 'width', layer.sizeCurrent.width );  
        }

        // Set ID.
        //
        svgLayerCurrent.setAttribute( "id", layer.id + "svg" );

        // Append new layer to DOM and reappend the selection layer so its always on top.
        //   
        $( svgContainer ).append( svgLayerCurrent );
        $( svgContainer ).append( svgSelect );      
    }

    function svgLayerUpdate( event, layer )
    {
        // Set type specific attributes.
        // 
        if( "text" === layer.type )
        {
            htmlParagraphCurrent = $( svgLayerCurrent ).find( "p" )[0];
            htmlParagraphCurrent.innerHTML        = layer.text;
            htmlParagraphCurrent.style.color      = layer.color; 
            htmlParagraphCurrent.style.fontSize   = layer.fontSize + "px";
            htmlParagraphCurrent.style.fontFamily = layer.font;

            svgLayerCurrent.setAttribute( 'height', layer.sizeCurrent.height );
        }

        // Set attributes.
        //  
        svgLayerCurrent.setAttribute( 'visibility', layer.visible ? 'visible' : 'hidden' );
        svgLayerCurrent.setAttribute( 'transform', 'matrix(' + layer.matrix[ 0 ][ 0 ] + ',' + layer.matrix[ 1 ][ 0 ] + ',' + layer.matrix[ 0 ][ 1 ] + ',' + layer.matrix[ 1 ][ 1 ] + ',' + layer.matrix[ 0 ][ 2 ] + ',' + layer.matrix[ 1 ][ 2 ] + ')' );
    }

    function svgLayerSelect( event, layer )
    {
        svgLayerCurrent = $( "#" + layer.id + "svg" )[0];

        // If we have a layer change selection properties to match its dimensions.
        //
        if( layer )
        {
            svgSelect.setAttribute( 'transform', 'matrix(' + layer.matrix[ 0 ][ 0 ] + ',' + layer.matrix[ 1 ][ 0 ] + ',' + layer.matrix[ 0 ][ 1 ] + ',' + layer.matrix[ 1 ][ 1 ] + ',' + layer.matrix[ 0 ][ 2 ] + ',' + layer.matrix[ 1 ][ 2 ] + ')' );

            if( "text" === layer.type )
            {
                svgSelect.setAttribute( 'height', layer.sizeCurrent.height );
            }

            $ecardViewport.trigger( "positionElementResize", [ layer.positionRotated, layer.sizeRotated ] );
        }

        // If we have no layer to select or if its hidden hide the selection rectangle as well.
        //
        if( event.type == "layerSelect" )
        {
            svgSelect.setAttribute( 'visibility', layer.visible ? 'visible' : 'hidden' );

            if( "image" === layer.type )
            {
                svgSelect.setAttribute( 'height', layer.sizeReal.height );
                svgSelect.setAttribute( 'width', layer.sizeReal.width ); 
            }

            if( "text" === layer.type )
            {
                svgSelect.setAttribute( 'width', layer.sizeCurrent.width );  
            }

            $ecardViewport.trigger( "visibilityElementResize", [ layer.visible ] );
        }
    }

    function svgLayerVisibility( event, layer )
    {
        var $svgLayerToToggle = $( "#" + layer.id + "svg" );

        $svgLayerToToggle.attr( 'visibility', layer.visible ? 'visible' : 'hidden' );

        // We only want to hide the selection layer if its around the currently selected layer.
        //
        if( layer.selected )
        {
            svgSelect.setAttribute( 'visibility', layer.visible ? 'visible' : 'hidden' );
            $ecardViewport.trigger( "visibilityElementResize", [ layer.visible ] );
        }
    }

    function svgLayerRemove( event, layer )
    {
        var $svgLayerToRemove = $( "#" + layer.id + "svg" );

        // Remove layer from DOM.
        //
        $svgLayerToRemove.remove();
        
        // Hide selection rectangles.
        //
        svgSelect.setAttribute( 'visibility', 'hidden' );
        $ecardViewport.trigger( "visibilityElementResize", [ false ] );
    }

    function svgLayerResize( delta, direction )
    {
        $ecardBuilder.trigger( "layerResize", [ delta, direction ] );
    }

    return module;
});