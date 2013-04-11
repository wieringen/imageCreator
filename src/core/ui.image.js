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
    ,   $imageCreatorSelection

    ,   $module
    ,   $moduleTitle
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
        $imageCreatorToolbar   = $( ".imageCreatorToolbar" );

        // Get module DOM elements.
        //
        $module               = $( ".imageCreatorUIImage" );
        $moduleTitle          = $module.find( ".moduleTitle" );
        $imageFilterStrength  = $module.find( ".imageFilterStrength" );
        $buttonImageUpload    = $module.find( ".buttonImageUpload" );
        $buttonImageAdd       = $( ".buttonImageAdd" );
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
        });
        $imageFilterStrength.slider(
        {
            "start"     : 100
        ,   "scale"     : [ 0, 100 ]
        ,   "unit"      : "%"
        });
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
        $.subscribe( "layerSelect", imageSelect );
        $.subscribe( "layerVisibility", imageSelect );
        $.subscribe( "fileUpload", imageAdd );

        // Listen to UI module events.
        //
        $imageFilterStrength.bind( "onDrag", imageFilterStrength );

        // Set Button events.
        //
        $selectFilter.change( imageFilter );
        $imageDecorationsList.delegate( "img", "tap", imageAdd );
        $imageBackgroundsList.delegate( "img", "tap", backgroundAdd );
        $buttonImageUpload.bind( "click", imageUpload );
        $buttonImageAdd.click( function()
        {
            $module.removeClass( "moduleDisabled" );
            $module.trigger( "setTab", [ 1 ] );

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
                $module.trigger( "setTab", [ 0 ] );
            }
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
        ,   scale : 0.3335
        };

        modelImage.fromObject( layer, function( instance )
        {
            cache.setLayerActive( instance );
        });

        return false;
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

    return module;
} );