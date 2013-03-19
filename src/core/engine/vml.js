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
,   "toolbar/layers"
],
function( config, layers )
{
    var module =
        {
            name     : "vml"
        ,   options  : {}
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas

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
        $imageCreatorViewport = $( ".imageCreatorViewport" );
        $imageCreatorCanvas   = $( ".imageCreatorCanvas" );

        // Set the viewport's dimensions.
        //
        canvasWidth  = config.options.viewportWidth;
        canvasHeight = config.options.viewportHeight;

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
        var vmlSelect = $( "<rvml:rect id='vmlSelect' strokecolor='#666' strokeweight='1px'><rvml:stroke dashstyle='dash'></rvml:stroke></rvml:rect>" )[0];
        $imageCreatorCanvas.html( vmlSelect );

        // Listen to global app events.
        //
        $.pubsub( "subscribe", "layerUpdate", vmlLayerCheck );
        $.pubsub( "subscribe", "layerSelect", vmlLayerSelect );
        $.pubsub( "subscribe", "layerVisibility", vmlLayerVisibility );
        $.pubsub( "subscribe", "layerRemove", vmlLayerRemove );
        $.pubsub( "subscribe", "layersRedraw", vmlBuildLayers );

        // Set UI events.
        //
        $imageCreatorCanvas.delegate( ".vmlObject", "click", vmlLayerTapSelect );

        // Do we have any layers allready?
        //
        vmlBuildLayers();
    };

    function vmlBuildLayers()
    {
        $imageCreatorCanvas.find( ".vmlObject" ).remove();

        var layersObject = layers && layers.getAllLayers() || {};

        $.each( layersObject.layers || [], vmlLayerCheck );
    }

    function vmlLayerCheck( event, layer )
    {
        vmlLayerCurrent = $( "#" + layer.id + module.name )[0];

        // If we dont have a layer in the dom its new so create it.
        //
        if( ! vmlLayerCurrent )
        {
            vmlLayerCreate( event, layer );
        }

        // Update layer properties
        //
        vmlLayerUpdate( event, layer );

        // Set the selection rectangle around the current layer.
        //
        if( layer.selected )
        {
            vmlLayerSelect( event, layer );
        }
    }

    function vmlLayerCreate( event, layer )
    {
        // Create DOM object from layer object.
        //
        if( "image" === layer.type )
        {
            vmlLayerCurrent = document.createElement( "img" );
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
        vmlLayerCurrent.setAttribute( "class", "vmlObject" );

        vmlLayerCurrent.style.setAttribute( "zoom", "1" );
        vmlLayerCurrent.style.setAttribute( "position", "absolute" );

        // Append new layer to DOM and reappend the selection layer so its always on top.
        //   
        $imageCreatorCanvas.append( vmlLayerCurrent );
        $imageCreatorCanvas.append( vmlSelect );      
    }

    function vmlLayerUpdate( event, layer )
    {
        var isPartialUpdate = event.indexOf && event.indexOf( "partial" ) > -1;

        // Set type specific attributes.
        // 
        if( "text" === layer.type && ! isPartialUpdate )
        {
            htmlParagraphCurrent = $( vmlLayerCurrent ).find( "p" )[0];

            var buildTextString = "";

            $.each( layer.textLines, function( index, line )
            {
                buildTextString += line + "</br>";
            });

            htmlParagraphCurrent.innerHTML        = buildTextString;
            htmlParagraphCurrent.style.color      = layer.color; 
            htmlParagraphCurrent.style.fontSize   = layer.fontSize + "px";
            htmlParagraphCurrent.style.fontFamily = layer.font;
            htmlParagraphCurrent.style.fontWeight = layer.weight ? "bold" : "normal";
            htmlParagraphCurrent.style.fontStyle  = layer.style ? "italic" : "normal";

            vmlLayerCurrent.style.setAttribute( 'height', layer.sizeCurrent.height + "px" );
            vmlLayerCurrent.style.setAttribute( 'width', layer.sizeCurrent.width + "px" );
        }
 
        // Only use the icky ms proprietary matrix filter if the browser is pre ie9.
        //
        //if( ! document.addEventListener )

        // Filters suck.. So lets use them only if we really have too.
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
        // something hacky to work around supporting the transform-origin property.
        //
        var originCorrection = ieCorrectOrigin( layer.sizeCurrent, layer.rotation.radians );

        vmlLayerCurrent.style.setAttribute( "top",  layer.position.y + originCorrection.y + "px" );
        vmlLayerCurrent.style.setAttribute( "left", layer.position.x + originCorrection.x + "px" );

        //$( vmlLayerCurrent ).css( "msTransform", 'matrix(' + layer.rotation.cos + ',' + layer.rotation.sin + ',' + -layer.rotation.sin + ',' + layer.rotation.cos + ',' + layer.position.x + ',' + layer.position.y + ')' );
        //$( vmlLayerCurrent ).css( "msTransform", 'matrix(' + layer.matrix[ 0 ] + ',' + layer.matrix[ 3 ] + ',' + layer.matrix[ 1 ] + ',' + layer.matrix[ 4 ] + ',' + layer.matrix[ 2 ] + ',' + layer.matrix[ 5 ] + ')' );
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
        if( event.indexOf && event.indexOf( "layerUpdate" ) === -1 )
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

    function vmlLayerTapSelect( event )
    {
        $.pubsub( "publish", "layerSelectByID", this.id.replace( module.name, "" ) );
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