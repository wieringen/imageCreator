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
,   "model.text"
,   "model.image"
,   "util.misc"

,   "plugins/jquery.storage"
],
function( config, modelText, modelImage, utilMisc )
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

            for( var layerIndex = layersStored.length; layerIndex--; )
            {
                if( layersStored[ layerIndex ].type === "image" )
                {
                    promises.unshift( modelImage.fromObject( layersStored[ layerIndex ] ) );
                }

                if( layersStored[ layerIndex ].type === "text" )
                {
                    promises.unshift( modelText.fromObject( layersStored[ layerIndex ] ) );
                }
            }

            utilMisc.whenAll( promises ).done( module.setLayers );
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
        layers = data;

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