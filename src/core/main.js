/**
 * @description 
 *
 * @namespace imageCreator
 * @name controller
 * @version 1.0
 * @author mbaijs
 */

 // Set up the paths and inital modules for the app.
 //
requirejs.config({
    paths: {
        // App paths
        //
        "plugins"     : "../lib"
    ,   "engine"      : "engine"
    ,   "toolbar"     : "toolbar"
    ,   "templates"   : "../templates"

        // Require plugins
        //
    ,   "lazyRequire" : "../lib/require/lazyRequire"
    ,   "text" : "../lib/require/text"
    }
});

require(
[
    "lazyRequire"
,   "utils"
,   "selection"
],
function( lazyRequire, utils, selection )
{   
    var theApp = window[ "imageCreator" ] = 
        {
            engine  : ""
        ,   toolbar : {}
        }
    ,   mouse  = {}

    ,   $imageCreator  = null
    ,   $ecardViewport = null
    ;

    var settings = theApp.settings = $.extend(
    {
        viewportWidth  : 520
    ,   viewportHeight : 360

    ,   engine : 
        [ 
            {
                name    : "svg"
            ,   support : utils.testForSVG
            ,   order   : 1
            }
        ,   {
                name    : "vml"
            ,   support : utils.testForVML
            ,   order   : 2
            }
        ,   {
                name    : "canvas"
            ,   support : utils.testForCanvas
            ,   order   : 3
            }          
        ]

    ,   toolbar : [ "info", "layers", "image", "text" ]

    }, theApp.settings );

    $( document ).ready( function()
    {
        $imageCreator  = $( ".imageCreator" );
        $ecardViewport = $( ".ecardViewport" );

        // Setup the layer resizer/rotater selection.
        //
        selection.initialize();

        // Set viewport events.
        //
        $ecardViewport.mousedown( viewportDragStart );

        // Set engine precedence.
        //
        settings.engine.sort( function( engineA, engineB )
        {
            return engineA.order - engineB.order;
        });

        // Load engine
        //
        $.each( settings.engine || [], loadEngine );

        $imageCreator.bind( "loadEngine", loadEngine );

        // Create toolbar.
        //
        $.each( settings.toolbar || [], loadTool );

        $imageCreator.bind( "loadTool", loadTool );
    } );

    function loadEngine( event, engineObject )
    {
        if( "function" === typeof engineObject.support && engineObject.support() )
        {
            var requireOnce = lazyRequire.once();

            requireOnce(
                [
                    "engine/" + engineObject.name
                ]
            ,   function( engine )
                {
                    theApp.engine = engine;
                }
            ,   function()
                {
                    theApp.engine.initialize();
                }
            );

            return false;
        }
    }

    function loadTool( event, toolName )
    {
        var requireOnce = lazyRequire.once();

        requireOnce(
            [
                "toolbar/" + toolName
            ]
        ,   function( tool )
            {
                theApp.toolbar[ toolName ] = tool;
            }
        ,   function()
            {   
                theApp.toolbar[ toolName ].initialize();
            }
        );
    }

    function viewportDragStart( event )
    {
        mouse.x = event.clientX;
        mouse.y = event.clientY;

        $( "body" ).addClass( "noSelect" );

        $ecardViewport.mousemove( viewportDragMove );

        $( document ).mouseup( function( event )
        {
            $( "body" ).removeClass( "noSelect" );

            $ecardViewport.unbind( "mousemove" );
            $( document ).unbind( "mouseup" );
        });       
    }

    function viewportDragMove( event )
    {
        var delta = 
        {
            x : event.clientX - mouse.x
        ,   y : event.clientY - mouse.y
        };

        $imageCreator.trigger( "viewportMove", delta );

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        return false;      
    }

} );