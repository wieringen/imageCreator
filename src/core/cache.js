/**
 * @description The main module.
 *
 * @namespace imageCreator
 * @name controller
 * @version 1.0
 * @author mbaijs
 */

// Set up the paths and inital modules for the app.
//
define(
[
    "config"
,   "util.misc"

,   "plugins/jquery.storage"
],
function( config, utilMisc )
{
    var module = {}

    // Cache keys
    //
    ,   keyLayers      = "ImageCreatorLayers"
    ,   keyLayerActive = "ImageCreatorLayerActive"

    // Private cache variables
    //
    ,   layers      = []
    ,   layerActive = false
    ;

    module.initialize = function()
    {
        // Save the state of the canvas when the app is unloaded.
        //
        $( window ).unload( module.storeLayers );

        // Load saved cache.
        //
        module.loadLayers();
    };

    module.loadLayers = function()
    {
        var layersStored    = $.Storage.get( keyLayers )
        ,   promises        = []
        ,   deferred        = null;
        ;

        if( layersStored )
        {
            layersStored = $.parseJSON( layersStored );

            utilMisc.loadModules( config.options.models, "model", function( models )
            {
                var modelType = "";

                for( var layerIndex = layersStored.length; layerIndex--; )
                {
                    modelType = layersStored[ layerIndex ].type;

                    if( models[ modelType ] )
                    {
                        promises.unshift( models[ modelType ].fromObject( layersStored[ layerIndex ] ) );
                    }
                }

                utilMisc.whenAll( promises ).done( module.setLayers );
            });
        }
    };

    module.storeLayers = function()
    {
        var layersToSave = [];

        for( var layerIndex = layers.length; layerIndex--; )
        {
            layersToSave.push( layers[ layerIndex ].toObject() );
        }

        $.Storage.set( keyLayers, JSON.stringify( layersToSave ) );
    };

    module.clearLayers = function()
    {
        layers = [];

        $.Storage.remove( keyLayers );
    };

    module.getLayers = function()
    {
        return layers;
    };

    module.setLayers = function( data )
    {
        for( var layerIndex = data.length; layerIndex--; )
        {
            module.setLayer( data[ layerIndex ] );
        }

        $.publish( "layersRedraw" );

        return layers;
    };

    module.setLayer = function( layer )
    {
        if( layer.plane === "background" )
        {
            for( var layerIndex = layers.length; layerIndex--; )
            {
                if( layers[ layerIndex ].plane === "background" )
                {
                    module.removeLayer( layers[ layerIndex ] );
                }
            }

            layers.unshift( layer );

            $.publish( "layersRedraw" );
        }
        else
        {
            layers.push( layer );
        }

        return layer;
    };

    module.setLayerActive = function( layer )
    {
        var isNewLayer = true;

        if( typeof layer === "object" )
        {
            for( var layerIndex = layers.length; layerIndex--; )
            {
                layers[ layerIndex ].set( "selected", false );

                if( layers[ layerIndex ].id === layer.id )
                {
                    layerActive = layers[ layerIndex ];

                    isNewLayer = false;
                }
            }

            if( isNewLayer )
            {
                module.setLayer( layer );

                layerActive = layer;
            }

            layerActive.set( "selected", true );
        }
        else
        {
            layerActive = false;
        }

        $.publish( "layerSelect", [ layerActive ] );

        return layerActive;
    };

    module.setLayerActiveByID = function( layerID )
    {
        return module.setLayerActive( module.getLayerById( layerID ) );
    }

    module.getLayerActive = function()
    {
        return layerActive;
    };

    module.getLayerById = function( layerID )
    {
        var layer = false;

        if( layerID )
        {
            for( var layerIndex = layers.length; layerIndex--; )
            {
                if( layers[ layerIndex ].id === layerID )
                {
                    layer = layers[ layerIndex ];
                }
            }
        }

        return layer;
    };

    module.removeLayer = function( layer )
    {
        var layerIndex = $.inArray( layer, layers );

        if( layer.selected )
        {
            module.setLayerActive( false );
        }

        layers.splice( layerIndex, 1 );

        $.publish( "layerRemove", [ layer.id ] );

        layer = null;
    }

    module.removeLayerByID = function( layerID )
    {
        var layer = module.getLayerById( layerID );

        if( layer )
        {
            module.removeLayer( layer );
        }

        layer = null;
    }

    return module;
} );