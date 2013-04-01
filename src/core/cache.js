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
,   "plugins/jquery.storage"
],
function( config )
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
        var storedLayers = $.Storage.get( keyLayers );

        if( storedLayers )
        {
            layers = JSON.parse( storedLayers );
        }
    };

    module.storeLayers = function()
    {
        $.Storage.set( keyLayers, JSON.stringify( layers ) );
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
    };

    module.setLayerActiveByID = function( layerID )
    {
        if( layerID )
        {
            for( var layerIndex = layers.length; layerIndex--; )
            { 
                layers[ layerIndex ].set( "selected", false );

                if( layers[ layerIndex ].id === layerID )
                {
                    layerActive = layers[ layerIndex ];
                    layerActive.set( "selected", true );
                }
            }
        }

        $.publish( "layerSelect", [ layerActive ] );

        return layerActive;
    }

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
        var layerIndex = $.inArray(layer, layers);

        layers.splice(layerIndex, 1);
    }

    return module;
} );