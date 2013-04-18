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
    ,   $layerContainer
    ,   $selectRenderEngine
    ,   $inputConstrainLayers
    ,   $inputAutoSelectLayer
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
        $layerContainer       = $module.find( ".layerContainer" );
        $selectRenderEngine   = $module.find( ".selectRenderEngine" );
        $inputConstrainLayers = $module.find( ".inputConstrainLayers" );
        $buttonImageSave      = $( ".buttonImageSave" );
        $emptyMessage         = $module.find( ".emptyMessage" );

        // Initialize module ui.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });

        // Listen for module ui events.
        //
        $layerContainer.delegate( ".objectLayer", "tap", layerSelectByID );
        $layerContainer.delegate( ".objectToggle", "tap", layerVisibilityById );
        $layerContainer.delegate( ".objectRemove", "tap", layerRemoveByID );
        $selectRenderEngine.change( optionRenderEngineSelect );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerCheck );
        $.subscribe( "layerRemove", layerRemove );
        $.subscribe( "layerVisibility", layerVisibility );
        $.subscribe( "layersRedraw", layersRedraw );

        // Get module snippets.
        //
        module.snippets.$objectLayerSnippet = $module.find( ".objectLayer" ).remove();
        module.snippets.$engineSnippet      = $module.find( ".selectRenderEngineItem" ).remove();

        // Populate the module user interface.
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
        $layerContainer.find( ".objectLayer" ).remove();

        $.each( cache.getLayers(), layerCheck );
    }

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
        var layerID = $( this ).parent().attr( "id" ).replace( "objectLayer", "" )
        ,   layer   = cache.getLayerById( layerID )
        ;

        layer.set( "visible", ! layer.visible );

        $.publish( "layerVisibility", [ layer ] );

        return false;
    }

    function layerVisibility( event, layer )
    {
        $( "#objectLayer" + layer.id ).toggleClass( "hide", layer.visibility );

        return false;
    }

    function optionRenderEngineSelect( event )
    {
        $.publish( "loadEngine", $( this ).find( ":selected" ).data( "engine" ) );
    }

    return module;
} );