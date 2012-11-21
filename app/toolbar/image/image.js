/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace ecardBuilder.toolbar
 * @name image
 * @version 1.0
 * @author mbaij
 */
 ;( function( $, context, appName )
 {

    var theApp        = $.getAndCreateContext( appName, context )
    ,   utils         = $.getAndCreateContext( "utils", theApp )
    ,   settings      = {}
    ,   image         = {}

    ,   moduleEnabled = true

    ,   $ecardBuilder
    ,   $viewport
    ,   $module
    ,   $imageZoom
    ,   $imageRotate
    ,   $buttonImageAdd

    ,   layerDefault = 
        {
            id              : null
        ,   type            : "image"

        ,   image           : null
        ,   sizeReal        : { "width": 0, "height": 0 }
        
        // Unrotated position and size.
        //
        ,   sizeCurrent     : { "width": 0, "height": 0 }
        ,   position        : { "x": 0, "y": 0 } 

        // Rotated position and size.
        //
        ,   sizeRotated     : { "width": 0, "height": 0 }
        ,   positionRotated : { "x": 0, "y": 0 } 
        ,   rotation        : 0

        // Difference between unrotated and rotated size.
        //
        ,   offset          : { "x": 0, "y": 0 }

        ,   visible         : true
        }

    // The curent layer that is being edited.
    //
    ,   layerCurrent = false   
    ;

    theApp.toolbar.image = image;

    /**
     * @description 
     *
     * @namespace ecardBuilder.toolbar.image
     * @name initialize
     * 
     * @param
     */
    image.initialize = function( options )
    {
        settings = options;

        $ecardBuilder  = $( ".ecardBuilder" );
        $ecardViewport = $( ".ecardViewport" );

        // Get module DOM elements.
        //
        $module         = $( ".toolbarImage" );
        $imageZoom      = $module.find( ".imageZoom" );
        $imageRotate    = $module.find( ".imageRotate" );        
        $buttonImageAdd = $module.find( ".buttonImageAdd" ); 

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu" : ".moduleMenu"
        ,   "tabs" : ".moduleBody"
        });
        $imageZoom.slider( 
        { 
            "start" : 100
        ,   "scale" : settings.imageZoomScale
        ,   "unit"  : "%"
        });
        $imageRotate.circleSlider();

        // Listen to global app events.
        //
        $ecardBuilder.bind( "viewportMove", imagePosition );
        $ecardBuilder.bind( "layerSelect", imageSelect );
        $ecardBuilder.bind( "layerResize", imageResize );
        $ecardViewport.bind( "fileUpload", imageAdd );

        // Listen to UI module events.
        //    
        $imageZoom.bind( "onDrag", imageZoom );
        $imageRotate.bind( "onDrag", imageRotate );
 
        // Set Button events.
        //       
        $buttonImageAdd.click( imageAdd );        
    };

    function imageSelect( event, layer )
    {
        // Enable module if layer is of the correct type.
        //
        moduleEnabled = layer.type === "image" || false;
        $module.toggleClass( "moduleDisabled", ! moduleEnabled ); 

        if( moduleEnabled )
        {
            layerCurrent = layer;
            
            // Set the UI to match the selected layers properties.
            //
            $imageRotate.trigger( "setPosition", [ layerCurrent.rotation ] );
            $imageZoom.trigger( "setPosition", [ layer ? Math.round( layerCurrent.sizeCurrent.width * settings.imageZoomScale[ 1 ] / layerCurrent.sizeReal.width ) : 0 ] );        
        }
    }

    function imageResize( event, delta, direction )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function imageAdd( event, file )
    {
        var url = file && file.target.result;

        // Temp
        //
        if( ! url )
        {
            var  dummy = [ "images/girl.jpg", "images/girl2.jpg" ];
            url = dummy[Math.floor(Math.random()*dummy.length)]     
        }

        // Clone and set layer defaults.
        //
        layerCurrent = $.extend( true, {}, layerDefault );

        // Set layer options.
        //
        layerCurrent.id        = "image" + new Date().getTime().toString();        
        layerCurrent.image     = new Image();
        layerCurrent.layerName = url.substring( url.lastIndexOf("/") + 1 );

        // Set image loading events.
        //
        $( layerCurrent.image ).load( imageLoadSuccess );
        $( layerCurrent.image ).error( imageLoadError );

        layerCurrent.image.src = url;

        return false;
    }

    function imageLoadSuccess()
    {
        // Since loading of the image is a success we can enable the module.
        //
        moduleEnabled = true;

        // Set the unmanipulated size of the image.
        //
        layerCurrent.sizeReal.width  = this.width;
        layerCurrent.sizeReal.height = this.height;

        // Scale the unrotated size of the image also downscale it a bit.
        //
        layerCurrent.sizeCurrent.width  = Math.round( this.width / settings.imageDownScale );
        layerCurrent.sizeCurrent.height = Math.round( this.height / settings.imageDownScale );
 
        // In this stage no manipulation has happend so rotated size is the same as the unrotated size.
        //       
        layerCurrent.sizeRotated = layerCurrent.sizeCurrent;

        // Set the layer's position to the center of the viewport. 
        //   
        var position = 
        {
            x : ( theApp.settings.viewportWidth / 2 ) - ( layerCurrent.sizeCurrent.width / 2 )
        ,   y : ( theApp.settings.viewportHeight / 2 ) - ( layerCurrent.sizeCurrent.height / 2 )
        };

        imagePosition( false, position, true );

        // Tell the app we have a new layer.
        //
        $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
    }

    function imageLoadError()
    {

    }

    function imageRotate( event, degrees )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.rotation    = degrees;
            
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, degrees );

            imagePosition( false, { x: 0, y: 0 }, true );

            // Tell the app there a change in the current layer's rotation.
            //
            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function imageZoom( event, scale )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {
            var sizeNew = 
                {
                    width  : Math.round( scale * layerCurrent.sizeReal.width / settings.imageZoomScale[ 1 ] )
                ,   height : Math.round( scale * layerCurrent.sizeReal.height / settings.imageZoomScale[ 1 ] )
                }
            ,   newPosition =
                {
                    x : ( layerCurrent.sizeCurrent.width - sizeNew.width ) / 2
                ,   y : ( layerCurrent.sizeCurrent.height - sizeNew.height ) / 2
                }
            ;

            layerCurrent.sizeCurrent = sizeNew;
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

            imagePosition( false, newPosition, true )

            $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function imagePosition( event, delta, internal )
    {
        if( moduleEnabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.position.x = Math.round( layerCurrent.position.x + delta.x );
            layerCurrent.position.y = Math.round( layerCurrent.position.y + delta.y );

            layerCurrent.offset.x = Math.round( ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2 );
            layerCurrent.offset.y = Math.round( ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.positionRotated.x = layerCurrent.position.x - layerCurrent.offset.x;
            layerCurrent.positionRotated.y = layerCurrent.position.y - layerCurrent.offset.y;

            imageConstrain();

            if( ! internal )
            {
                $ecardBuilder.trigger( "layerUpdate", [ layerCurrent ] );
            }
        }
    }

    function imageConstrain()
    {
        var ratio = { 
            width  : theApp.settings.viewportWidth - layerCurrent.sizeRotated.width
        ,   height : theApp.settings.viewportHeight - layerCurrent.sizeRotated.height
        };

        if(layerCurrent.positionRotated.x <= 0 + ( ratio.width < 0 ? ratio.width : 0) )
        { 
            layerCurrent.positionRotated.x = Math.round( ratio.width < 0 ? ratio.width : 0 );
        }

        if(layerCurrent.positionRotated.y <= 0 + ( ratio.height < 0 ? ratio.height : 0) )
        { 
            layerCurrent.positionRotated.y = Math.round( ratio.height < 0 ? ratio.height : 0 );
        }

        if(layerCurrent.positionRotated.x + ( ratio.width < 0 ? ratio.width : 0) >= ratio.width )
        { 
            layerCurrent.positionRotated.x = Math.round( ratio.width < 0 ? 0 : ratio.width );
        }

        if(layerCurrent.positionRotated.y + ( ratio.height < 0 ? ratio.height : 0) >= ratio.height )
        { 
            layerCurrent.positionRotated.y = Math.round( ratio.height < 0 ? 0 : ratio.height );
        }

        layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + layerCurrent.offset.x );
        layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + layerCurrent.offset.y );
    }

} )( jQuery, window, "ecardBuilder" );