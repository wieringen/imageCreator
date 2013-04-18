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
    // Template.
    //
    "text!templates/library.html"

    // Core.
    //
,   "config"
,   "cache"
,   "model.image"

    // Libraries.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.dropArea"
],
function( moduleHTML, config, cache, modelImage )
{
    var module =
        {
            name     : "library"
        ,   enabled  : true
        ,   options  : config.options.ui.library
        ,   snippets : {}
        }

    ,   $imageCreatorViewport

    ,   $module
    ,   $libraryUploadSubmit
    ,   $libraryUploadFrame
    ,   $libraryUploadForm

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

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module              = $( module.options.target );
        $libraryUploadSubmit = $module.find( ".libraryUploadSubmit" );
        $libraryUploadFrame  = $module.find( ".libraryUploadFrame" );
        $libraryUploadForm   = $module.find( ".libraryUploadForm" );

        // Initialize module ui.
        //
        $module.tabular(
        {
            "menu"     : ".moduleMenu"
        ,   "tabs"     : "a"
        ,   "pages"    : ".moduleTab"
        });
        $imageCreatorViewport.dropArea();

        // Listen for module ui events.
        //
        $libraryUploadSubmit.bind( "click", imageUpload );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerSelect );
        $.subscribe( "layerVisibility", layerSelect );
        $.subscribe( "fileUpload", imageAdd );
    };

    function layerSelect( event, layer )
    {
        $module.addClass( "moduleDisabled" );
    }

    function imageUpload()
    {
        // Temp!!! Just used for debugging puposes.
        //
        $libraryUploadForm.submit();
        $libraryUploadFrame.unbind( "load" ).load( function( event )
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
        ,   plane     : "background"
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
        ,   scale : 0.3335
        };

        modelImage.fromObject( layer, function( instance )
        {
            cache.setLayerActive( instance );
        });

        return false;
    }

    return module;
} );