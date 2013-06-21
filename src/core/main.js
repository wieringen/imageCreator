/**
*
* @module main
*/

// Set up the paths and inital modules for the app.
//
requirejs.config(
{
    paths :
    {
        // App paths
        //
        "plugins"   : "../lib"
    ,   "templates" : "../templates"

        // Require plugins
        //
    ,   "text"          : "../lib/require/text"
    ,   "cs"            : "../lib/require/cs"
    ,   "coffee-script" : "../lib/require/coffee-script"
    }
});

require(
[
    // App core modules.
    //
    "config"
,   "cache"
,   "cs!util.misc"

    // Libraries
    //
,   "plugins/jquery.pubsub"
,   "plugins/jquery.hammer"
],
function( config, cache, utilMisc )
{
    var ui, engines;

    $( document ).ready( function()
    {
        // Initialize config and make some shorthand vars.
        //
        config.initialize();

        ui      = config.options.ui;
        engines = config.options.engines;

        // Setup (touch) events and gestures.
        //
        $( document ).hammer({
            scale_treshold    : 0
        ,   drag_min_distance : 0
        });

        // Initialize the user interface.
        //
        utilMisc.loadModules( ui, "ui", function( modules )
        {
            $.each( ui, function( moduleName )
            {
                if( modules[ moduleName ] )
                {
                    modules[ moduleName ].initialize();
                }
            });
        });

        // Start render engine.
        //
        $.each( engines.order, function( index, engineName )
        {
            if( engines.types[ engineName ].support )
            {
                loadEngine( false, engineName, function( engine )
                {
                    // Since the engine is now running. We can fetch and initialize our cache.
                    //
                    cache.initialize();
                });

                return false;
            }
        });

        // Listen for global app events.
        //
        $.subscribe( "loadEngine", loadEngine );
    } );

    function loadEngine( event, engineName, callback )
    {
        require( [ "engine." + engineName ], function( engine )
        {
            // Fire up the engine.
            //
            engine.initialize();

            callback && callback( engine );
        });
    }
} );