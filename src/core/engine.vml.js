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
    // App core modules
    //
    "config"
,   "cache"
],
function( config, cache )
{
    var module =
        {
            name : "vml"
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas

    ,   canvasWidth
    ,   canvasHeight

    //,   vmlSelect
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

        $imageCreatorCanvas.css( { width : canvasWidth, height : canvasHeight } );

        // Initialize VML.
        //
        document.createStyleSheet().cssText = 'rvml\\:* { behavior:url(#default#VML); }';

        if( "object" === typeof document.namespaces )
        {
            document.namespaces.add('rvml', 'urn:schemas-microsoft-com:vml', '#default#VML');
        }

        // Create a selection rectangle to put around selected layers.
        //
        var vmlSelect = $( "<rvml:rect id='vmlSelect' strokecolor='#000000' strokeweight='1px'><rvml:stroke dashstyle='dash'></rvml:stroke></rvml:rect>" )[0];
        $imageCreatorCanvas.html( vmlSelect );

        // Remove other engines that may be listening.
        //
        $.unsubscribe( ".engine" );

        // Listen to global app events.
        //
        $.subscribe( "layerUpdate.engine", vmlLayerCheck );
        $.subscribe( "layerSelect.engine", vmlLayerCheck );
        $.subscribe( "layerVisibility.engine", vmlLayerVisibility );
        $.subscribe( "layerRemove.engine", vmlLayerRemove );
        $.subscribe( "layersRedraw.engine", vmlBuildLayers );

        // Do we have any layers allready?
        //
        vmlBuildLayers();
    };

    function vmlBuildLayers()
    {
        $imageCreatorCanvas.find( ".vmlObject" ).remove();

        $.each( cache.getLayers(), vmlLayerCheck );
    }

    function vmlLayerCheck( event, layer, partial )
    {
        if( layer )
        {
            // If we dont have a layer in the dom its new so create it.
            //
            if( ! $( "#" + layer.id + module.name )[0] )
            {
                vmlLayerCreate( event, layer );
            }

            // Update layer properties
            //
            vmlLayerUpdate( event, layer, partial );
        }

        // Set the selection rectangle around the current layer or hide it.
        //
        vmlLayerSelect( event, layer );
    }

    function vmlLayerCreate( event, layer )
    {
        var vmlLayerCurrent;

        if( "image" === layer.type )
        {
            vmlLayerCurrent = document.createElement( "img" );
            vmlLayerCurrent.setAttribute( "src", layer.image.src );

            vmlLayerCurrent.style.setAttribute( "height", layer.sizeReal.height + "px" );
            vmlLayerCurrent.style.setAttribute( "width", layer.sizeReal.width + "px" );
        }

        if( "text" === layer.type )
        {
            vmlLayerCurrent = document.createElement( "div" );
            vmlLayerCurrent.style.setAttribute( 'width', layer.sizeCurrent.width + "px" );

            vmlLayerCurrent.appendChild( document.createElement( "p" ) );
        }

        vmlLayerCurrent.setAttribute( "id", layer.id + module.name );
        vmlLayerCurrent.setAttribute( "class", "vmlObject" );

        vmlLayerCurrent.style.setAttribute( "zoom", "1" );
        vmlLayerCurrent.style.setAttribute( "position", "absolute" );

        // Append new layer to DOM and reappend the selection layer so its always on top.
        //
        $imageCreatorCanvas.append( vmlSelect );
        $imageCreatorCanvas.append( vmlLayerCurrent );
    }

    function vmlLayerUpdate( event, layer, partial )
    {
        var vmlLayerCurrent = $( "#" + layer.id + module.name )[0];

        // Set type specific attributes.
        //
        if( "text" === layer.type && ! partial )
        {
            var htmlParagraphCurrent = $( vmlLayerCurrent ).find( "p" )[0];


            htmlParagraphCurrent.innerText        = layer.text;
            htmlParagraphCurrent.style.color      = layer.color;
            htmlParagraphCurrent.style.fontSize   = layer.fontSize + "px";
            htmlParagraphCurrent.style.fontFamily = layer.font;
            htmlParagraphCurrent.style.fontWeight = layer.weight ? "bold" : "normal";
            htmlParagraphCurrent.style.fontStyle  = layer.style ? "italic" : "normal";
            htmlParagraphCurrent.style.lineHeight = Math.floor( layer.fontSize * layer.lineHeight ) + "px";

            vmlLayerCurrent.style.setAttribute( 'height', layer.sizeCurrent.height + "px" );
            vmlLayerCurrent.style.setAttribute( 'width', layer.sizeCurrent.width + "px" );
        }

        // MS Filters suck.. So lets use them only if we really have too.
        //
        if( layer.type !== "text" || layer.rotation.degrees > 0 && layer.rotation.degrees < 360)
        {
            vmlLayerCurrent.style.setAttribute( "filter", 'progid:DXImageTransform.Microsoft.Matrix(' + 'M11=' + layer.matrix[ 0 ] + ', M12=' + layer.matrix[ 1 ] + ', M21=' + layer.matrix[ 3 ] + ', M22=' + layer.matrix[ 4 ] + ', sizingMethod=\'auto expand\'' + ')' );
        }
        else
        {
            vmlLayerCurrent.style.removeAttribute( "filter" );
        }

        // Since we unfortunately do not have the possibility to use translate with sizing method 'auto expand', we need to do
        // something hacky to work around the lack of support for the transform-origin property.
        //
        var originCorrection = ieCorrectOrigin( layer.sizeCurrent, layer.rotation.radians );

        vmlLayerCurrent.style.setAttribute( "top",  layer.position.y + originCorrection.y + "px" );
        vmlLayerCurrent.style.setAttribute( "left", layer.position.x + originCorrection.x + "px" );
    }

    function vmlLayerSelect( event, layer )
    {
        // If we have a layer change selection properties to match its dimensions.
        //
        if( layer && layer.selected )
        {
            vmlSelect.style.setAttribute( "rotation", layer.rotation.degrees );
            vmlSelect.style.setAttribute( "height", ( layer.sizeCurrent.height + 1 ) + "px" );
            vmlSelect.style.setAttribute( "width",  ( layer.sizeCurrent.width  + 1 )+ "px" );
            vmlSelect.style.setAttribute( "position", "absolute" );
            vmlSelect.style.setAttribute( "top",  ( layer.position.y - 1 ) + "px" );
            vmlSelect.style.setAttribute( "left", ( layer.position.x - 1 ) + "px" );

            // It is no longer possible to create/append a VML element outside of the DOM in >= ie8. This hack fixes that.
            //
            if( document.all && document.querySelector )
            {
                vmlSelect.outerHTML = vmlSelect.outerHTML;
            }

            // Somehow setting the fillcolor only works after we have done the hack above :/
            //
            vmlSelect.fillcolor = "none";
        }

        // If we have no layer to select or if its hidden hide the selection rectangle as well.
        //
        if( event.type !== "layerUpdate" )
        {
            vmlSelect.style.setAttribute( "visibility", layer.visible && layer.selected ? "visible" : "hidden" );
        }
    }

    function vmlLayerVisibility( event, layer )
    {
        $( "#" + layer.id + module.name ).css( "visibility", layer.visible ? "visible" : "hidden" );

        // We only want to hide the selection layer if its around the currently selected layer.
        //
        if( layer.selected )
        {
            vmlSelect.style.setAttribute( 'visibility', layer.visible ? 'visible' : 'hidden' );
        }
    }

    function vmlLayerRemove( event, layerID )
    {
        $( "#" + layerID + module.name ).remove();
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
        };
    }

    return module;
} );