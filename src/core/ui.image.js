/** 
 * Image tool Class
 * 
 * @name Image
 * @class Image
 * @constructor
 *
 */
define(
[
    // Module HTML template.
    //
    "text!templates/image.html"

    // App core modules.
    //
,   "config"
,   "cache"
,   "model.image"

    // jQuery plugins.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
,   "plugins/jquery.circleSlider"
,   "plugins/jquery.dropArea"    
],
function( moduleHTML, config, cache, modelImage )
{
    var module =
        {
            name     : "image.ui"
        ,   enabled  : true
        ,   options  : config.options.ui.image
        ,   filters  : config.options.filters.color
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $module
    ,   $moduleTitle
    ,   $imageCreatorSelection   
    ,   $imageZoom
    ,   $imageRotate
    ,   $buttonImageUpload
    ,   $buttonImageAdd
    ,   $imageDecorationsList
    ,   $imageBackgroundsList 
    ,   $selectFilter

    ,   layerCurrent = false
    ;


    /**
      * Function that initializes the module. It will append the modules html, set the title and initializes its UI.
      *
      * @name Image#initialize
      * @function
      *
      */
    module.initialize = function( options )
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport  = $( ".imageCreatorViewport" );
        $imageCreatorSelection = $( ".imageCreatorSelection" );

        // Get module DOM elements.
        //
        $module               = $( ".imageCreatorToolImage" );
        $moduleTitle          = $module.find( ".moduleTitle" );
        $imageZoom            = $module.find( ".imageZoom" );
        $imageRotate          = $module.find( ".imageRotate" ); 
        $imageFilterStrength  = $module.find( ".imageFilterStrength" );
        $buttonImageUpload    = $module.find( ".buttonImageUpload" ); 
        $buttonImageAdd       = $module.find( ".buttonImageAdd" ); 
        $imageDecorationsList = $module.find( ".imageDecorationsList" ); 
        $imageBackgroundsList = $module.find( ".imageBackgroundsList" );
        $selectFilter         = $module.find( ".selectFilter" );

        // Set module title.
        //
        $moduleTitle.text( module.options.title );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"     : ".moduleMenu"
        ,   "tabs"     : "a"
        ,   "pages"    : ".moduleTab"
        ,   "callback" : function()
            {
                $buttonImageAdd.show();
            }
        });
        $imageZoom.slider( 
        { 
            "start"     : 100
        ,   "scale"     : module.options.zoomScale
        ,   "downScale" : module.options.downScale
        ,   "unit"      : "%"
        });
        $imageFilterStrength.slider( 
        { 
            "start"     : 100
        ,   "scale"     : [ 0, 100 ]
        ,   "unit"      : "%"
        });

        $imageRotate.circleSlider();
        $imageCreatorViewport.dropArea();

        // Get snippets.
        //
        module.snippets.$filterSnippet = $module.find( ".selectFilterItem" ).remove();

        // Generate filters.
        //
        $.each( module.filters, function( filterKey, filter )
        {
            var $filterClone = module.snippets.$filterSnippet.clone();
            
            $filterClone.attr( "value", filterKey );
            $filterClone.text( filter.name );

            $selectFilter.append( $filterClone );
        }); 

        // Listen to global app events.
        //
        $.subscribe( "viewportPinch", imagePinch );        
        $.subscribe( "viewportMove", imagePosition );
        $.subscribe( "layerSelect", imageSelect );
        $.subscribe( "layerVisibility", imageSelect );
        $.subscribe( "fileUpload", imageAdd );

        // Listen to selection events.
        //        
        $imageCreatorSelection.bind( "onRotate", imageRotate );
        $imageCreatorSelection.bind( "onScale", imageScale );

        // Listen to UI module events.
        //    
        $imageZoom.bind( "onDrag", imageScale );
        $imageRotate.bind( "onDrag", imageRotate );
        $imageFilterStrength.bind( "onDrag", imageFilterStrength );

        // Set Button events.
        //       
        $selectFilter.change( imageFilter ); 
        $imageDecorationsList.delegate( "img", "tap", imageAdd );
        $imageBackgroundsList.delegate( "img", "tap", backgroundAdd );
        $buttonImageUpload.bind( "click", imageUpload );         
        $buttonImageAdd.click( function()
        {
            $module.trigger( "setTab", [ 3 ] );
            $buttonImageAdd.hide();

            return false;
        });

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
        $module.toggleClass( "moduleLocked", ! layer.locked ); 

        if( module.enabled )
        {
            layerCurrent = layer;
            
            // Set the UI to match the selected layers properties.
            //
            if( ! layer.locked )
            {
                $module.trigger( "setTab", [ 2 ] );
            }
            $imageRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            $imageZoom.trigger( "setPosition", [ layerCurrent.scale ] );        
            $imageFilterStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );
            $selectFilter.val( layerCurrent.filter.name.toLowerCase() );
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

            if( json && json.code !== 200 )
            {
                $imageCreatorViewport.trigger( "setMessage", [ {
                    "message" : json.message
                ,   "status"  : "error"
                ,   "fade"    : false
                }]);
            }
            else
            {
                imageAdd( json.src );
            }
        });

        return false;
    }

    function backgroundAdd( url )
    {
        var layer = 
        {
            locked    : true
        ,   imageType : "background"
        ,   position  : 
            {
                x : 0
            ,   y : 0
            } 
        ,   scale : 1
        ,   src : typeof url === "string" ? url : this.src
        };

        modelImage.fromObject( layer, function( instance )
        {
            cache.setLayerActive( instance );
        });

        return false;        
    }

    function imageAdd( url )
    {
        var layer = 
        {
            src   : typeof url === "string" ? url : this.src
        ,   scale : 100 / module.options.downScale           
        };

        modelImage.fromObject( layer, function( instance )
        {
            cache.setLayerActive( instance );
        });

        return false;        
    }

    function imagePinch( event, delta )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            var deltaScale    = ( layerCurrent.scale + ( delta.scale / 2 ) ).toFixed( 2 )
            ,   radians       = utils.sanitizeRadians( layerCurrent.rotation.radians + utils.toRadians( delta.rotate ) )
            ,   deltaRotation = 
                {
                    radians : radians
                ,   degrees : Math.round( utils.toDegrees( radians ) )
                ,   sin     : Math.sin( radians )
                ,   cos     : Math.cos( radians )
                }
            ;

            imageZoom( event, deltaScale, true );
            imageScale( event, deltaRotation, true );
        }
    }

    function imageRotate( event, rotation, setUI )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setRotate( rotation );
            
            if( setUI )
            {
                $imageRotate.trigger( "setPosition", [ rotation.degrees ] );
            }

            $.publish( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function imageScale( event, scale, setUI )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setScale( scale );

            if( setUI )
            {
                $imageZoom.trigger( "setPosition", [ scale ] );
            }

            $.publish( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function imageFilter( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFilter( module.filters[ this.value ] );

            $imageFilterStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );

            $.publish( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    function imageFilterStrength( event, strength )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setFilterStrength( strength );

            $.publish( "layerUpdate", [ layerCurrent ] ); 
        }    
    }

    function imagePosition( event, delta )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setPosition( delta );

            $.publish( "layerUpdate", [ layerCurrent, true ] ); 
        }
    }

    return module;
} );