// Set up the paths and inital modules for the app.
//
define(
[
    "config"
,   "cs!util.misc"

,   "plugins/jquery.storage"
],
function( config, utilMisc )
{
    var module = {}

    // Cache keys
    //
    ,   keyProject = "ImageCreatorProject"

    // Private cache variables
    //
    ,   project =
        {
            views :
            {
                front :
                {
                    layers : []
                }
            }
        }
    ,   layers = []

    ,   viewActive  = false
    ,   layerActive = false
    ;

    module.initialize = function()
    {
        // Save the state of the canvas when the app is unloaded.
        //
        $( window ).unload( module.storeProject );

        // Load saved cache.
        //
        module.loadProject();
    };

    module.loadProject = function( data, viewName )
    {
        project = data || $.parseJSON( $.Storage.get( keyProject ) );

        module.setViewActive( viewName || "front" );
    };

    module.storeProject = function()
    {
        var layersToSave = [];

        // Loop to all the layers of this view and turn them into objects.
        //
        for( var layerIndex = layers.length; layerIndex--; )
        {
            layersToSave.push( layers[ layerIndex ].toObject() );
        }

        viewActive.layers = layersToSave;

        $.Storage.set( keyProject, JSON.stringify( project ) );
    };

    module.getProject = function()
    {
        return project;
    };

    module.setViewActive = function( viewName )
    {
        if( project && project.views && project.views[ viewName ] )
        {
            viewActive = project.views[ viewName ];

            module.loadLayers( viewActive.layers );
        }
    };

    module.getViewActive = function()
    {
        return viewActive;
    };

    module.getLayers = function()
    {
        return layers;
    };

    module.loadLayers = function( data )
    {
        var promises = [];

        if( data )
        {
            // Get all the models classes we have.
            //
            utilMisc.loadModules( config.options.models, "cs!model", function( models )
            {
                var modelType = "";

                for( var layerIndex = data.length; layerIndex--; )
                {
                    modelType = data[ layerIndex ].type;

                    // Convert our layer object to a layer model.
                    //
                    if( models[ modelType ] )
                    {
                        promises.unshift( models[ modelType ].fromObject( data[ layerIndex ] ) );
                    }
                }

                // When all promises are resolved set them in the cache
                //
                utilMisc.whenAll( promises ).done( module.setLayers );
            });
        }
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
            // We only want 1 background layer so remove all others.
            //
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
                // Unset all the selected flags in all cached layers
                //
                layers[ layerIndex ].set( "selected", false );

                // If the layer already is present in our cache reference it.
                //
                if( layers[ layerIndex ].id === layer.id )
                {
                    layerActive = layers[ layerIndex ];

                    isNewLayer = false;
                }
            }

            // If the layer is new first add it to our cache then reference it.
            //
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
        var layerIndex = $.inArray( layer, layers );

        if( layer.selected )
        {
            module.setLayerActive( false );
        }

        layers.splice( layerIndex, 1 );

        $.publish( "layerRemove", [ layer.id ] );

        layer = null;
    };

    module.removeLayerByID = function( layerID )
    {
        var layer = module.getLayerById( layerID );

        if( layer )
        {
            module.removeLayer( layer );
        }

        layer = null;
    };

    return module;
} );