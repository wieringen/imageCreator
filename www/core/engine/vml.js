/**
 * @description <p>The VML engine implementation.</p>
 *
 * @namespace imageCreator.engine
 * @name vml
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery"
],
function( $ )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name        : "vml"
        ,   settings    : 
            {
            }
        }

    ,   $imageCreator
    ,   $ecardViewport
    ,   $ecardCanvas

    ,   canvasWidth
    ,   canvasHeight

    ,   vmlLayerCurrent
    ,   htmlParagraphCurrent
    //,   vmlSelect
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

        $ecardCanvas.css( { width : canvasWidth, height : canvasHeight } );

        // Initialize VML.
        //
        document.createStyleSheet().cssText = 'rvml\\:* { behavior:url(#default#VML); }';                              

        if( "object" === typeof document.namespaces )
        {
            document.namespaces.add('rvml', 'urn:schemas-microsoft-com:vml', '#default#VML');
        }

        // Create a selection rectangle to put around selected layers.
        //
        var vmlSelect = $( "<rvml:rect id='vmlSelect' strokecolor='#666' strokeweight='1px'><rvml:stroke dashstyle='dash'></rvml:stroke></rvml:rect>" )[0];
        $ecardCanvas.html( vmlSelect );

        // Remove other engines that may be listening.
        //
        $imageCreator.unbind( ".engine" );

        // Listen to global app events.
        //
        $imageCreator.bind( "layerUpdate.engine", vmlLayerCheck );
        $imageCreator.bind( "layerSelect.engine", vmlLayerSelect );
        $imageCreator.bind( "layerVisibility.engine", vmlLayerVisibility );
        $imageCreator.bind( "layerRemove.engine", vmlLayerRemove );

        // Do we have any layers allready?
        //
        vmlBuildLayers();
    };

    function vmlBuildLayers()
    {
        var layersObject = theApp.toolbar.layers && theApp.toolbar.layers.getAllLayers() || {};

        $.each( layersObject.layers || [], vmlLayerCheck );
    }

    function vmlLayerCheck( event, layer )
    {
        vmlLayerCurrent = $( "#" + layer.id + module.name )[0];

        // If we dont have a layer in the dom its new so create it.
        //
        if( ! vmlLayerCurrent )
        {
            vmlLayerCreate( false, layer );
        }

        // Update layer properties
        //
        vmlLayerUpdate( false, layer );

        // Set the selection rectangle around the current layer.
        //
        if( layer.selected )
        {
            vmlLayerSelect( false, layer );
        }
    }

    function vmlLayerCreate( event, layer )
    {
        // Create DOM object from layer object.
        //
        if( "image" === layer.type )
        {
            vmlLayerCurrent = document.createElement('rvml:image');
            vmlLayerCurrent.setAttribute( "src", layer.image.src );

            vmlLayerCurrent.style.setAttribute( "height", layer.sizeReal.height + "px" );
            vmlLayerCurrent.style.setAttribute( "width", layer.sizeReal.width + "px" );
        }

        if( "text" === layer.type )
        {
            vmlLayerCurrent      = document.createElement( "div" );
            htmlParagraphCurrent = document.createElement( "p" );
            vmlLayerCurrent.style.setAttribute( 'width', layer.sizeCurrent.width + "px" );  
            
            vmlLayerCurrent.appendChild( htmlParagraphCurrent );
        }

        // Set attributes.
        //
        vmlLayerCurrent.setAttribute( "id", layer.id + module.name );
        vmlLayerCurrent.style.setAttribute( "zoom", "1" );
        vmlLayerCurrent.style.setAttribute( "position", "absolute" );

        // Append new layer to DOM and reappend the selection layer so its always on top.
        //   
        $ecardCanvas.append( vmlLayerCurrent );
        $ecardCanvas.append( vmlSelect );      
    }

    function vmlLayerUpdate( event, layer )
    {
        // Set type specific attributes.
        // 
       if( "text" === layer.type )
        {
            htmlParagraphCurrent = $( vmlLayerCurrent ).find( "p" )[0];
            htmlParagraphCurrent.innerHTML        = layer.text;
            htmlParagraphCurrent.style.color      = layer.color; 
            htmlParagraphCurrent.style.fontSize   = layer.fontSize + "px";
            htmlParagraphCurrent.style.fontFamily = layer.font;
            htmlParagraphCurrent.style.fontWeight = layer.weight ? "bold" : "normal";
            htmlParagraphCurrent.style.fontStyle  = layer.style ? "italic" : "normal";

            vmlLayerCurrent.style.setAttribute( 'height', layer.sizeCurrent.height + "px" );
        }
 
        // Only use the icky filter matrix if the browser is pre ie9.
        //
        if( ! document.addEventListener )
        {
            vmlLayerCurrent.style.setAttribute( "filter", 'progid:DXImageTransform.Microsoft.Matrix(' + 'M11=' + layer.matrix[ 0 ] + ', M12=' + layer.matrix[ 1 ] + ', M21=' + layer.matrix[ 3 ] + ', M22=' + layer.matrix[ 4 ] + ', sizingMethod=\'auto expand\'' + ')' );

            // Since we unfortunately do not have the possibility to use translate with sizing method 'auto expand', we need to do
            // something hacky to work around supporting the transform-origin property.
            //
            var originCorrection = ieCorrectOrigin( layer.sizeCurrent, layer.rotation.radians );
            vmlLayerCurrent.style.setAttribute( "top",  layer.position.y + originCorrection.y + "px" );
            vmlLayerCurrent.style.setAttribute( "left", layer.position.x + originCorrection.x + "px" );
        }
        else
        {
            $( vmlLayerCurrent ).css( "msTransform", 'matrix(' + layer.rotation.cos + ',' + layer.rotation.sin + ',' + -layer.rotation.sin + ',' + layer.rotation.cos + ',' + layer.position.x + ',' + layer.position.y + ')' );
        }

        // It is no longer possible to create a VML element outside of the DOM in >= ie8. This hack fixes that.
        //
        vmlLayerCurrent.outerHTML = vmlLayerCurrent.outerHTML;
    }

    function vmlLayerSelect( event, layer )
    {
        vmlLayerCurrent = $( "#" + layer.id + module.name )[0];

        // If we have a layer change selection properties to match its dimensions.
        //
        if( layer )
        {
            vmlSelect.style.setAttribute( "rotation", layer.rotation.degrees ); 
            vmlSelect.style.setAttribute( "height", ( layer.sizeCurrent.height + 1 ) + "px" );
            vmlSelect.style.setAttribute( "width",  ( layer.sizeCurrent.width  + 1 )+ "px" );
            vmlSelect.style.setAttribute( "position", "absolute" );
            vmlSelect.style.setAttribute( "top",  ( layer.position.y - 1 ) + "px" );
            vmlSelect.style.setAttribute( "left", ( layer.position.x - 1 ) + "px" );

            // It is no longer possible to create a VML element outside of the DOM in >= ie8. This hack fixes that.
            //
            if( document.all && document.querySelector ) 
            {
                vmlSelect.outerHTML = vmlSelect.outerHTML;
            }

            // Somehow the fillcolor only works after we have done the hack above :/
            //
            vmlSelect.fillcolor = "none";
        }

        // If we have no layer to select or if its hidden hide the selection rectangle as well.
        //
        if( event.type !== "layerUpdate" )
        {
            vmlSelect.style.setAttribute( 'visibility', layer.visible ? 'visible' : 'hidden' );
        }
    }

    function vmlLayerVisibility( event, layer )
    {
        var $vmlLayerToToggle = $( "#" + layer.id + module.name );

        $vmlLayerToToggle.css( 'visibility', layer.visible ? 'visible' : 'hidden' );

        // We only want to hide the selection layer if its around the currently selected layer.
        //
        if( layer.selected )
        {
            vmlSelect.style.setAttribute( 'visibility', layer.visible ? 'visible' : 'hidden' );
        }
    }

    function vmlLayerRemove( event, layer )
    {
        var $vmlLayerToRemove = $( "#" + layer.id + module.name );

        // Remove layer from DOM.
        //
        $vmlLayerToRemove.remove();
        
        // Hide selection rectangles.
        //
        vmlSelect.setAttribute( 'visibility', 'hidden' );
    }

    // http://balzerg.blogspot.co.il/2012/08/analytical-fix-for-ie-rotation-origin.html
    //
    function ieCorrectOrigin( size, radians )
    {
        var rad = radians %= Math.PI;
    
        if( rad > Math.PI / 2 )
        {
            rad = Math.PI - rad;
        }

        var sin = Math.sin( -rad )
        ,   cos = Math.cos(  rad )
        ;
        return {
            y : ( size.height - size.height * cos + size.width  * sin ) / 2
        ,   x : ( size.width  - size.width  * cos + size.height * sin ) / 2
        }
    }

    return module;
} );