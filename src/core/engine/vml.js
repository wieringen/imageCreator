/**
 * @description <p>The VML engine implementation.</p>
 *
 * @namespace ecardBuilder.engine
 * @name vml
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
            name        : "vml"
        ,   initialized : false
        ,   settings    : 
            {
            }
        }

    ,   $ecardBuilder
    ,   $ecardViewport

    ,   canvasWidth
    ,   canvasHeight

    ,   vmlLayerCurrent
    ,   htmlParagraphCurrent
    ;

    module.initialize = function()
    {
        // Get basic app DOM elements.
        //
        $ecardBuilder  = $( ".ecardBuilder" );
        $ecardViewport = $( ".ecardViewport" );

        // Set the viewport's dimensions.
        //
        canvasWidth  = theApp.settings.viewportWidth;
        canvasHeight = theApp.settings.viewportHeight;

        $ecardViewport.css( { width : canvasWidth, height : canvasHeight } );

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
        $ecardViewport.append( vmlSelect );

        // Listen to global app events.
        //
        if( ! module.initialized )
        {
            $ecardBuilder.bind( "layerUpdate", vmlLayerCheck );
            $ecardBuilder.bind( "layerSelect", vmlLayerSelect );
            $ecardBuilder.bind( "layerVisibility", vmlLayerVisibility );
            $ecardBuilder.bind( "layerRemove", vmlLayerRemove );
        }

        // Setup the element resizer.
        //
        $ecardViewport.elementResize({
            "resizeCallback" : vmlLayerResize
        });

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

        // Set ID.
        //
        vmlLayerCurrent.setAttribute( "id", layer.id + module.name );
        vmlLayerCurrent.style.setAttribute( "zoom", "1" );
        vmlLayerCurrent.style.setAttribute( "position", "absolute" );

        // Append new layer to DOM and reappend the selection layer so its always on top.
        //   
        $ecardViewport.append( vmlLayerCurrent );
        $ecardViewport.append( vmlSelect );      
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

            vmlLayerCurrent.style.setAttribute( 'height', layer.sizeCurrent.height + "px" );
        }

        // Set attributes.
        //
        vmlLayerCurrent.style.setAttribute( "filter", 'progid:DXImageTransform.Microsoft.Matrix(' + 'M11=' + layer.matrix[ 0 ][ 0 ] + ', M12=' + layer.matrix[ 0 ][ 1 ] + ', M21=' + layer.matrix[ 1 ][ 0 ] + ', M22=' + layer.matrix[ 1 ][ 1 ] + ', sizingMethod=\'auto expand\'' + ')' );

        // Since we unfortunately do not have the possibility to use translate with sizing method 'auto expand', we need to do
        // something hacky to work around supporting the transform-origin property.
        //
        var originCorrection = ieCorrectOrigin( layer.sizeCurrent, layer.rotation.radians );
        vmlLayerCurrent.style.setAttribute( "top",  layer.position.y + originCorrection.y + "px" );
        vmlLayerCurrent.style.setAttribute( "left", layer.position.x + originCorrection.x + "px" );

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
            
            $ecardViewport.trigger( "positionElementResize", [ layer.positionRotated, layer.sizeRotated ] );
        }

        // If we have no layer to select or if its hidden hide the selection rectangle as well.
        //
        if( event.type == "layerSelect" )
        {
            vmlSelect.style.setAttribute( 'visibility', layer.visible ? 'visible' : 'hidden' );
            $ecardViewport.trigger( "visibilityElementResize", [ layer.visible ] );
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
            $ecardViewport.trigger( "visibilityElementResize", [ layer.visible ] );
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
        $ecardViewport.trigger( "visibilityElementResize", [ false ] );
    }

    function vmlLayerResize( delta, direction )
    {
        $ecardBuilder.trigger( "layerResize", [ delta, direction ] );
    }

    // http://balzerg.blogspot.co.il/2012/08/analytical-fix-for-ie-rotation-origin.html
    //
    function ieCorrectOrigin( size, radians )
    {
        var rad = radians;
        rad %= 2 * Math.PI;
        
        if (rad < 0)
        { 
            rad += 2 * Math.PI;
        }

        rad %= Math.PI;
        
        if (rad > Math.PI / 2)
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