/**
 * @description
 *
 * @namespace imageCreator
 * @name ui.layers
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // Template
    //
    "text!templates/layers.html"

    // Core
    //
,   "config"
,   "cache"

    // Libraries.
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
    ,   $layersContainer
    ,   $selectRenderEngine
    ,   $buttonImageSave
    ,   $emptyMessage
    ;

    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module               = $( module.options.target );
        $layersContainer      = $module.find( ".layersContainer" );
        $selectRenderEngine   = $module.find( ".selectRenderEngine" );
        $buttonImageSave      = $( ".buttonImageSave" );
        $emptyMessage         = $module.find( ".emptyMessage" );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });

        // Listen for module UI events.
        //
        $layersContainer.delegate( ".layer", "tap", layerSelectByID );
        $layersContainer.delegate( ".layerToggle", "tap", layerVisibilityById );
        $layersContainer.delegate( ".layerRemove", "tap", layerRemoveByID );
        $selectRenderEngine.change( optionRenderEngineSelect );
        $buttonImageSave.bind( "tap", function()
        {
            cache.storeProject();

            $.publish( "message", {
                "message" : JSON.stringify( cache.getProject() )
            ,   "status"  : "error"
            ,   "fade"    : false
            } );
        });

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerCheck );
        $.subscribe( "layerRemove", layerRemove );
        $.subscribe( "layerVisibility", layerVisibility );
        $.subscribe( "layersRedraw", layersRedraw );

        // Get module snippets.
        //
        module.snippets.$layerSnippet  = $module.find( ".layer" ).remove();
        module.snippets.$engineSnippet = $module.find( ".selectRenderEngineItem" ).remove();

        // Populate the module UI.
        //
        populateUI();

        // Do we have any layers allready?
        //
        layersRedraw();
    };

    function populateUI()
    {
        // Add all the supported engines.
        //
        $.each( module.engines.order, function( engineIndex, engineName )
        {
            var engine = module.engines.types[ engineName ];

            if( engine.support )
            {
                var $engineClone = module.snippets.$engineSnippet.clone();

                $engineClone.attr( "value", engineName );
                $engineClone.text( engineName );
                //$engineClone.attr( "selected", engineName === config.engine.name );
                $engineClone.data( "engine", engineName );

                $selectRenderEngine.append( $engineClone );
            }
        });
    }

    function layersRedraw()
    {
        $layersContainer.find( ".layer" ).remove();

        $.each( cache.getLayers(), layerCheck );
    }

    function layerCheck( event, layer )
    {
        if( layer && 0 === $( "#layer" + layer.id ).length )
        {
            layerCreate( event, layer );
        }

        layerSelect( event, layer );
    }

    function layerCreate( event, layer )
    {
        $emptyMessage.hide();

        $layerClone = module.snippets.$layerSnippet.clone();
        $layerClone.attr( "id", "layer" + layer.id );

        if( layer.image )
        {
            $layerClone.find( ".layerName" ).text( layer.name );
            $layerClone.find( "img" ).attr( "src", layer.image.src );
        }

        if( layer.text )
        {
            $layerClone.find( ".layerName" ).text( layer.text );
            //$layerClone.find( "img" ).attr( "src", objectLayer.image.src );
        }

        $layersContainer.prepend( $layerClone );
    }

    function layerSelectByID( event )
    {
        var layerID = $( this ).attr( "id" ).replace( "layer", "" );

        cache.setLayerActiveByID( layerID );

        return false;
    }

    function layerSelect( event, layer )
    {
        $layersContainer.find( ".active" ).removeClass( "active" );
        $( "#layer" + layer.id ).addClass( "active" );
    }

    function layerRemoveByID( event )
    {
        var layerID = $( this ).parent().attr( "id" ).replace( "layer", "" );

        cache.removeLayerByID( layerID );

        return false;
    }

    function layerRemove( event, layerID )
    {
        $( "#layer" + layerID ).remove();

        // Show empty message if we have no more layers.
        //
        if( 0 === $layersContainer.find( ".layer" ).length )
        {
            $emptyMessage.show();
        }
    }

    function layerVisibilityById( event )
    {
        var layerID = $( this ).parent().attr( "id" ).replace( "layer", "" )
        ,   layer   = cache.getLayerById( layerID )
        ;

        layer.set( "visible", ! layer.visible );

        $.publish( "layerVisibility", [ layer ] );

        return false;
    }

    function layerVisibility( event, layer )
    {
        $( "#layer" + layer.id ).toggleClass( "hide", layer.visibility );

        return false;
    }

    function optionRenderEngineSelect( event )
    {
        $.publish( "loadEngine", $( this ).find( ":selected" ).data( "engine" ) );
    }

    return module;
} );