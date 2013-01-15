/**
 * @description <p></p>
 *
 * @namespace imageCreator.toolbar
 * @name image
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // Module HTML template.
    //
    "text!templates/image.html"

    // App core modules.
    //
,   "config"
,   "utils"

    // jQuery plugins.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
,   "plugins/jquery.circleSlider"
,   "plugins/jquery.dropArea"    
],
function( moduleHTML, config, utils )
{
    var module =
        {
            name     : "image"
        ,   enabled  : true
        ,   options  : {}
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $module
    ,   $moduleTitle
    ,   $imageCreatorSelection   
    ,   $imageZoom
    ,   $imageRotate
    ,   $buttonImageAdd

    // The default properties of a image layer.
    //
    ,   layerDefault = 
        {
            id              : null
        ,   name            : ""
        ,   type            : "image"
        ,   visible         : true

        // Image layer specific properties.
        //
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

        // Difference between unrotated and rotated size.
        //
        ,   offset          : { "x": 0, "y": 0 }

        // Matrix calculations.
        //
        ,   scale           : 1
        ,   rotation        : { degrees: 0, radians : 0, sin: 0, cos: 1 }
        ,   matrix          : [ 1, 0, 0, 1, 0, 0 ]
        }

    // The curent layer that is being edited.
    //
    ,   layerCurrent = false   
    ;


    /**
      * @description Function that initializes the module. It will append the modules html, set the title and initializes its UI.
      *
      * @name module#initialize
      * @function
      *
      */
    module.initialize = function( options )
    {
        // Easy reference config options.
        //
        module.options = config.options.toolbar.image;

        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport  = $( ".imageCreatorViewport" );
        $imageCreatorSelection = $( ".imageCreatorSelection" );

        // Get module DOM elements.
        //
        $module         = $( ".imageCreatorToolImage" );
        $moduleTitle    = $module.find( ".moduleTitle" );
        $imageZoom      = $module.find( ".imageZoom" );
        $imageRotate    = $module.find( ".imageRotate" );        
        $buttonImageAdd = $module.find( ".buttonImageAdd" ); 

        // Set module title.
        //
        $moduleTitle.text( module.options.title );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleBody"
        });
        $imageZoom.slider( 
        { 
            "start" : 100
        ,   "scale" : module.options.imageZoomScale
        ,   "unit"  : "%"
        });
        $imageRotate.circleSlider();
        $imageCreatorViewport.dropArea();

        // Listen to global app events.
        //
        $imageCreatorViewport.bind( "viewportMove", imagePosition );
        $imageCreatorViewport.bind( "layerSelect", imageSelect );
        $imageCreatorViewport.bind( "layerVisibility", imageSelect );
        $imageCreatorViewport.bind( "fileUpload", imageAdd );

        // Listen to selection events.
        //        
        $imageCreatorSelection.bind( "onRotate", imageRotate );
        $imageCreatorSelection.bind( "onResize", imageResize );

        // Listen to UI module events.
        //    
        $imageZoom.bind( "onDrag", imageZoom );
        $imageRotate.bind( "onDrag", imageRotate );
 
        // Set Button events.
        //       
        $buttonImageAdd.click( imageUpload );        
    };

    function imageSelect( event, layer )
    {
        // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
        //
        if( event.type === "layerVisibility" && ! layer.selected )
        {
            return false;
        }

        // Enable module if layer is of the correct type and layer is visible.
        //
        module.enabled = layer.visible && layer.type === "image" || false;
        $module.toggleClass( "moduleDisabled", ! module.enabled ); 

        if( module.enabled )
        {
            layerCurrent = layer;
            
            // Set the UI to match the selected layers properties.
            //
            $imageRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            $imageZoom.trigger( "setPosition", [ layer ? Math.round( layerCurrent.sizeCurrent.width * module.options.imageZoomScale[ 1 ] / layerCurrent.sizeReal.width ) : 0 ] );        
        }
    }

    function imageResize( event, delta, direction )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.sizeCurrent = {
                    width  : Math.round( layerCurrent.scale * layerCurrent.sizeReal.width  )
                ,   height : Math.round( layerCurrent.scale * layerCurrent.sizeReal.height )
            };

            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

            layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2  );
            layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            imagePosition( false, { x : -delta.x, y: -delta.y }, true );

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function imageUpload()
    {
        // Temp!!! Just used for debugging puposes.
        //
        $( ".formImageUpload" ).submit();
        $( "#iframeImageUpload" ).unbind( "load" ).load( function( event )
        {
            var json = $.parseJSON( $( this ).contents().text() );

            $( ".message" ).html( json.message ).show();

            imageAdd( event, json.src );
        });

        return false;
    }

    function imageAdd( event, url )
    {
        // Temp
        //
        if( ! url )
        {
            var  dummy = [ "images/girl.jpg", "images/girl2.jpg" ];
            url = dummy[Math.floor(Math.random()*dummy.length)];    
        }

        // Clone and set layer defaults.
        //
        layerCurrent = $.extend( true, {}, layerDefault );

        // Set layer options.
        //
        layerCurrent.id    = "image" + new Date().getTime().toString();        
        layerCurrent.image = new Image();
        layerCurrent.name  = url.substring( url.lastIndexOf("/") + 1 );

        // Set image loading events.
        //
        layerCurrent.image.onload  = imageLoadSuccess;
        layerCurrent.image.onerror = imageLoadError;

        layerCurrent.image.src = url;

        return false;
    }

    function imageLoadSuccess()
    {
        // Since loading of the image is a success we can enable the module.
        //
        module.enabled = true;

        // Set the unmanipulated size of the image.
        //
        layerCurrent.sizeReal.width  = this.width;
        layerCurrent.sizeReal.height = this.height;

        // Scale the unrotated size of the image also downscale it a bit.
        //
        layerCurrent.sizeCurrent.width  = Math.round( this.width / module.options.imageDownScale );
        layerCurrent.sizeCurrent.height = Math.round( this.height / module.options.imageDownScale );

        // Adjust the scale to reflect the initial downscale.
        //
        layerCurrent.scale = 1 / module.options.imageDownScale;

        // In this stage no manipulation has happend so rotated size is the same as the unrotated size.
        //       
        layerCurrent.sizeRotated = layerCurrent.sizeCurrent;

        // Set the layer's position to the center of the viewport. 
        //   
        var position = 
        {
            x : ( config.options.viewportWidth / 2 ) - ( layerCurrent.sizeCurrent.width / 2 )
        ,   y : ( config.options.viewportHeight / 2 ) - ( layerCurrent.sizeCurrent.height / 2)
        };

        imagePosition( false, position, true );

        // Tell the app we have a new layer.
        //
        $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
    }

    function imageLoadError()
    {

    }

    function imageRotate( event, rotation )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            if( "onRotate" === event.type )
            {
                $imageRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            }

            layerCurrent.rotation = rotation;

            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, rotation );
    
            imagePosition( false, { x: 0, y: 0 }, true );

            // Tell the app there a change in the current layer's rotation.
            //
            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function imageZoom( event, sliderScale )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
           layerCurrent.scale = ( sliderScale / module.options.imageDownScale ) / 100;

            var sizeNew = 
                {
                    width  : Math.round( layerCurrent.scale * layerCurrent.sizeReal.width )
                ,   height : Math.round( layerCurrent.scale * layerCurrent.sizeReal.height )
                }
            ,   newPosition =
                {
                    x : ( layerCurrent.sizeCurrent.width - sizeNew.width ) / 2
                ,   y : ( layerCurrent.sizeCurrent.height - sizeNew.height ) / 2
                }
            ;

            layerCurrent.sizeCurrent = sizeNew;
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

            imagePosition( false, newPosition, true );

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    function imagePosition( event, delta, internal )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.position.x = Math.round( layerCurrent.position.x + delta.x );
            layerCurrent.position.y = Math.round( layerCurrent.position.y + delta.y );

            layerCurrent.offset.x = Math.round( ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2 );
            layerCurrent.offset.y = Math.round( ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.positionRotated.x = layerCurrent.position.x - layerCurrent.offset.x;
            layerCurrent.positionRotated.y = layerCurrent.position.y - layerCurrent.offset.y;

            imageConstrain();

            layerCurrent.matrix = utils.getMatrix( layerCurrent.rotation, layerCurrent.scale, layerCurrent.position, layerCurrent.sizeReal );

            if( ! internal )
            {
                $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
            }
        }
    }

    function imageConstrain()
    {
        if( config.options.toolbar.layers && ! config.options.toolbar.layers.constrainLayers )
        {
            return false;
        }

        var ratio = { 
            width  : config.options.viewportWidth - layerCurrent.sizeRotated.width
        ,   height : config.options.viewportHeight - layerCurrent.sizeRotated.height
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

    return module;
} );