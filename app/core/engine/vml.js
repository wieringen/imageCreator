/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace ecardBuilder.engine
 * @name vml
 * @version 1.0
 * @author mbaijs
 */
 ;( function( $, context, appName )
 {
    var theApp = $.getAndCreateContext( appName, context )
    ,   utils  = $.getAndCreateContext( "utils", theApp )
    ,   vml    = {}

    ,   $ecardBuilder
    ,   $ecardViewport

    ,   canvasWidth
    ,   canvasHeight
    ;

    vml.name = "vml";

    theApp.engine = vml;

    vml.initialize = function()
    {
        $ecardBuilder  = $( ".ecardBuilder" );
        $ecardViewport = $( ".ecardViewport" );

        // Set the viewport's dimensions.
        //
        canvasWidth  = theApp.settings.viewportWidth;
        canvasHeight = theApp.settings.viewportHeight;

        $ecardViewport.css( { width : canvasWidth, height : canvasHeight } );

        // Initialize VML.
        //
        document.createStyleSheet().cssText = 'rvml\\:* { behavior:url(#default#VML); display: inline-block}';                              

        if( "object" === typeof document.namespaces )
        {
            document.namespaces.add('rvml', 'urn:schemas-microsoft-com:vml', '#default#VML');
        }

        // Create a selection rectangle to put around selected layers.
        //
        var vmlSelect = "<rvml:rect id='vmlSelect' strokecolor='#666' strokeweight='2px' style='position: absolute;'><rvml:fill opacity='0' /><rvml:stroke dashstyle='dash'/></rvml:rect>";
        $ecardViewport.append( vmlSelect );

        // Setup the element resizer.
        //
        $ecardViewport.elementResize();

        // Listen to global app events.
        //
        $ecardBuilder.bind( "layerUpdate", vmlDraw );
        $ecardBuilder.bind( "layerVisibility", vmlLayerVisibility );
        $ecardBuilder.bind( "layerRemove", vmlLayerRemove );
    };

    function vmlDraw( event, layer )
    {
       var layerObject = $( "#" + layer.id + "vml" )[0]
       ,   vmlSelect   = $( "#vmlSelect" )[0]
       ;

        if( ! layerObject )
        {
            if( "image" === layer.type )
            {
                layerObject = document.createElement('rvml:image');
            }

            if( "text" === layer.type )
            {
                layerObject = document.createElementNS( "http://www.w3.org/2000/svg", "text" );
            }

            layerObject.setAttribute( "id", layer.id + "vml" );
            layerObject.style.setAttribute( "position", "absolute" );
            
            $ecardViewport.append( layerObject );
            $ecardViewport.append( vmlSelect );
        }

        if( "image" === layer.type )
        {
            layerObject.setAttribute( "src", layer.image.src );       
        }

        if( "text" === layer.type )
        {
            layerObject.textContent = layer.text;            
        }

        layerObject.style.setAttribute( "height", layer.sizeCurrent.height+ "px" );
        layerObject.style.setAttribute( "width", layer.sizeCurrent.width + "px" );
        layerObject.style.setAttribute( "top", layer.position.y + "px" );
        layerObject.style.setAttribute( "left", layer.position.x + "px" );
        layerObject.style.setAttribute( "rotation", layer.rotation ); 
        layerObject.setAttribute('visibility', layer.visible ? 'visible' : 'hidden' ); 
        layerObject.outerHTML = layerObject.outerHTML;

        vmlSelect.style.setAttribute('height',layer.sizeCurrent.height );
        vmlSelect.style.setAttribute('width',layer.sizeCurrent.width ); 
        vmlSelect.style.setAttribute( "top", layer.position.y + "px" );
        vmlSelect.style.setAttribute( "left", layer.position.x + "px" );
        vmlSelect.style.setAttribute( "rotation", layer.rotation ); 
        vmlSelect.style.setAttribute('visibility', layer.visible ? 'visible' : 'hidden' );
        vmlSelect.outerHTML = vmlSelect.outerHTML;

        $ecardViewport.trigger( "positionElementResize", [ layer.positionRotated, layer.sizeRotated ] );
    }

    function vmlLayerVisibility( event, layer, isSelectedLayer )
    {
        var vmlLayer  = $( "#" + layer.id + "vml" )[0]
        ,   vmlSelect = $( "#vmlSelect" )[0]
        ;

        vmlLayer.setAttribute('visibility', layer.visible ? 'visible' : 'hidden' );
        
        if( isSelectedLayer )
        {
            vmlSelect.style.setAttribute('visibility', layer.visible ? 'visible' : 'hidden' );
        }
    }

    function vmlLayerRemove( event, layer )
    {
        var $vmlLayer = $( "#" + layer.id + "vml" )
        ,   vmlSelect = $( "#vmlSelect" )[0]
        ;

        $vmlLayer.remove();
        vmlSelect.style.setAttribute( 'visibility', 'hidden' );
    }
} )( jQuery, window, "ecardBuilder" );