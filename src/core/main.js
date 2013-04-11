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
    ,   "lazyRequire" : "../lib/require/lazyRequire"
    ,   "text"        : "../lib/require/text"
    }
});

require(
[
    "config"
,   "cache"

,   "lazyRequire"

,   "plugins/jquery.pubsub"
,   "plugins/jquery.hammer"
],
function( config, cache, lazyRequire )
{
    var toolbar = {};

    $( document ).ready( function()
    {
        // Initialize config.
        //
        config.initialize();

        // Listen for global app events.
        //
        $.subscribe( "setMessage", setMessage );
        $.subscribe( "loadTool", loadTool );
        $.subscribe( "loadEngine", loadEngine );

        // Create UI.
        //
        $.each( config.options.ui || [], function( toolName, toolOptions )
        {
            loadTool( false, toolName, toolOptions );
        });

        // Load engine.
        //
        $.each( config.options.engines.order || [], function( engineIndex, engineName )
        {
            return loadEngine( false, engineName );
        });

        // Initialize cache.
        //
        cache.initialize();

        // Setup notifications events.
        //
        $( ".imageCreatorMessageClose" ).bind( "tap", function()
        {
            $imageCreatorMessage.hide();
        });

    } );

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

    function loadEngine( event, engineNane )
    {
        var engineObject = config.options.engines.types[ engineNane ];

        if( engineObject.support )
        {
            setMessage( {
                "message" : "Loading " + engineNane + " engine..."
            ,   "status"  : "loading"
            ,   "fade"    : true
            });

            var requireOnce = lazyRequire.once();

            requireOnce(
                [
                    "engine." + engineNane
                ]
            ,   function( engine )
                {
                    config.setEngine( engine );
                }
            ,   function()
                {
                    config.engine.initialize();
                }
            );

            return false;
        }
    }

    function loadTool( event, toolName, toolOptions )
    {
        if( config.options.ui[ toolName ] )
        {
            setMessage( {
                "message" : "Loading " + toolName + " tool..."
            ,   "status"  : "loading"
            ,   "fade"    : true
            });

            var requireOnce = lazyRequire.once();

            requireOnce(
                [
                    "ui." + toolName
                ]
            ,   function( tool )
                {
                    toolbar[ toolName ] = tool;
                }
            ,   function( tool )
                {
                    toolbar[ toolName ].initialize();
                }
            );
        }
    }

} );