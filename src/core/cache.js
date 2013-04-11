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
            layersStored = JSON.parse( layersStored );

            for( var layerIndex = layersStored.length; layerIndex--; )
            {
                if( layersStored[ layerIndex ].type === "image" )
                {
                    promises.unshift( modelImage.fromObject( layersStored[ layerIndex ] ) );
                }

                if( layersStored[ layerIndex ].type === "text" )
                {
                    deferred = ( new $.Deferred() ).resolve( new modelText( layersStored[ layerIndex ] ) );

                    promises.unshift( deferred );
                }
            }

            utilMisc.whenAll( promises ).done(function( models )
            {
                 layers = models;

                 $.publish( "layersRedraw" );
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
        if ( $.isPlainObject( data ) )
        {
            layers = data;
        }

        return layers;
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
                layers.push( layer );
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