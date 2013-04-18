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
requirejs.config(
{
    paths :
    {
        // App paths
        //
        "plugins"     : "../lib"
    ,   "templates"   : "../templates"

        // Require plugins
        //
    ,   "text"        : "../lib/require/text"
    }
});

require(
[
    // App core modules.
    //
    "config"
,   "cache"
,   "util.misc"

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

        ui      = config.options.ui
        engines = config.options.engines

        // Setup the user interface.
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
                loadEngine( engineName, function( engine )
                {
                    // Fire up the engine.
                    //
                    engine.initialize();

                    // Since the engine is now running. We can fetch and initialize our cache.
                    //
                    cache.initialize();
                });

                return false;
            }
        });

        // Setup (touch) events and gestures.
        //
        $( document ).hammer({
            scale_treshold    : 0
        ,   drag_min_distance : 0
        });


        // Listen for global app events.
        //
        $.subscribe( "setMessage", setMessage );

        // Setup notifications events.
        //
        $( ".imageCreatorMessageClose" ).bind( "tap", function()
        {
            $imageCreatorMessage.hide();
        });

    } );

    function loadEngine( engineName, callback )
    {
        require( [ "engine." + engineName ], callback );
    }

    function setMessage( options )
    {
        var $imageCreatorMessage      = $( ".imageCreatorMessage" )
        ,   $imageCreatorMessageInner = $( ".imageCreatorMessageInner" )
        ,   defaults =
            {
                "message"   : ""
            ,   "status"    : ""
            ,   "fade"      : true
            ,   "fadeTimer" : 300
            }
        ,   options      = $.extend( {}, defaults, options )
        ,   messageTimer = $imageCreatorMessage.data( "messageTimer" )
        ;

        $imageCreatorMessage.removeClass( "error loading notice" );
        $imageCreatorMessage.addClass( options.status );
        $imageCreatorMessage.show();

        $imageCreatorMessageInner.text( options.message );

        if( options.fade )
        {
            clearTimeout( messageTimer );

            messageTimer = setTimeout( function()
            {
                $imageCreatorMessage.hide();
            }, options.fadeTimer );

            $imageCreatorMessage.data( "messageTimer", messageTimer );
        }
    }

} );