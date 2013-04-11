/**
 * @description <p>A toolbar module that keeps track of all the layers.</p>
 *
 * @namespace imageCreator.toolbar
 * @name layers
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // Module HTML template
    //
    "text!templates/layers.html"

    // App core modules
    //
,   "config"
,   "cache"

    // jQuery plugins
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.sortable"
],
function( moduleHTML, config, cache )
{
    var module =
        {
            options  : config.options.ui.layers
        ,   engines  : config.options.engines
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $module
    ,   $moduleTitle
    ,   $layerContainer
    ,   $selectRenderEngine
    ,   $inputConstrainLayers
    ,   $inputAutoSelectLayer
    ,   $buttonImageSave
    ,   $emptyMessage
    ;

    /**
      * @description Function that initializes the module. It will append the modules html, set the title and initializes its UI.
      *
      * @name module#initialize
      * @function
      *
      */
    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module               = $( ".imageCreatorUILayers" );
        $moduleTitle          = $module.find( ".moduleTitle" );
        $layerContainer       = $module.find( ".layerContainer" );
        $selectRenderEngine   = $module.find( ".selectRenderEngine" );
        $inputConstrainLayers = $module.find( ".inputConstrainLayers" );
        $buttonImageSave      = $( ".buttonImageSave" );
        $emptyMessage         = $module.find( ".emptyMessage" );

        // Set module title.
        //
        $moduleTitle.text( module.options.title );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });

        // Get snippets.
        //
        module.snippets.$objectLayerSnippet = $module.find( ".objectLayer" ).remove();
        module.snippets.$engineSnippet      = $module.find( ".selectRenderEngineItem" ).remove();

        // Set inputs to match module options.
        //
        $inputConstrainLayers.attr( "checked", config.options.viewport.constrainLayers );

        $.each( module.engines.order, function( engineIndex, engineName )
        {
            var engine = module.engines.types[ engineName ];

            if( engine.support() )
            {
                var $engineClone = module.snippets.$engineSnippet.clone();

                $engineClone.attr( "value", engineName );
                $engineClone.text( engineName );
                $engineClone.attr( "selected", engineName === config.engine.name );
                $engineClone.data( "engine", engineName );

                $selectRenderEngine.append( $engineClone );
            }
        });

        // Listen to global app events.
        //
        $.subscribe( "layerSelect", layerCheck );
        $.subscribe( "layerRemove", layerRemove );
        $.subscribe( "layerVisibility", layerVisibility );

        // Set Button events.
        //
        $layerContainer.delegate( ".objectLayer", "tap", layerSelectByID );
        $layerContainer.delegate( ".objectToggle", "tap", layerVisibilityById );
        $layerContainer.delegate( ".objectRemove", "tap", layerRemoveByID );

        $selectRenderEngine.change( optionRenderEngineSelect );
        $inputConstrainLayers.change( optionConstrainLayersToggle );

        $( "body" ).delegate( ".buttonImageSave", "click", function()
        {
            $imageCreatorViewport.trigger( "setMessage", [ {
                "message" : "I'm sorry... This is just a frontend demo there is no connection with any backend or server."
            ,   "status"  : "error"
            ,   "fade"    : false
            }]);

            cache.storeLayers();
        });
    };

    function layerCheck( event, layer )
    {
        if( layer && 0 === $( "#objectLayer" + layer.id ).length )
        {
            layerCreate( event, layer );
        }

        layerSelect( event, layer );
    }

    function layerCreate( event, objectLayer )
    {
        $emptyMessage.hide();

        $layerClone = module.snippets.$objectLayerSnippet.clone();
        $layerClone.attr( "id", "objectLayer" + objectLayer.id );

        if( objectLayer.image )
        {
            $layerClone.find( ".objectLayerName" ).text( objectLayer.name );
            $layerClone.find( "img" ).attr( "src", objectLayer.image.src );
        }

        if( objectLayer.text )
        {
            $layerClone.find( ".objectLayerName" ).text( objectLayer.text );
            //$layerClone.find( "img" ).attr( "src", objectLayer.image.src );
        }

        $layerContainer.prepend( $layerClone );
    }

    function layerSelectByID( event )
    {
        var layerID = $( this ).attr( "id" ).replace( "objectLayer", "" );

        cache.setLayerActiveByID( layerID );

        return false;
    }

    function layerSelect( event, layer )
    {
        $layerContainer.find( ".active" ).removeClass( "active" );
        $( "#objectLayer" + layer.id ).addClass( "active" );
    }

    function layerRemoveByID( event )
    {
        var layerID = $( this ).parent().attr( "id" ).replace( "objectLayer", "" );

        cache.removeLayerByID( layerID );

        return false;
    }

    function layerRemove( event, layerID )
    {
        $( "#objectLayer" + layerID ).remove();

        // Show empty message if we have no more layers.
        //
        if( 0 === $layerContainer.find( ".objectLayer" ).length )
        {
            $emptyMessage.show();
        }
    }

    function layerVisibilityById( event )
    {
        var $layerToToggle = $( this ).parent()
        ,   layerID        = $layerToToggle.attr( "id" ).replace( "objectLayer", "" )
        ,   layer          = cache.getLayerById( layerID )
        ;

        layer.set( "visible", ! $layerToToggle.hasClass( "hide" ) );

        $.publish( "layerVisibility", [ layer ] );

        return false;
    }

    function layerVisibility( event, layer )
    {
        $layerToToggle.toggleClass( "hide", layer.visibility );

        return false;
    }

    function optionRenderEngineSelect( event )
    {
        $.publish( "loadEngine", $( this ).find( ":selected" ).data( "engine" ) );
    }

    function optionConstrainLayersToggle( event )
    {
        config.setOptions(
        {
            toolbar :
            {
                layers :
                {
                    constrainLayers : $inputConstrainLayers.is( ":checked" )
                }
            }
        });
    }

    return module;
} );