/**
 * @description 
 *
 * @namespace ecardBuilder
 * @name controller
 * @version 1.0
 * @author mbaijs
 */

 // Set up the paths and inital modules for the app.
 //
requirejs.config({
    paths: {
        // jQuery
        //
        "jquery"      : "https://ajax.googleapis.com/ajax/libs/jquery/1.8.3/jquery.min"
        
        // App paths
        //
    ,   "toolbar"     : "../toolbar"
    ,   "plugins"     : "../lib"
    ,   "engine"      : "engine"

        // Require plugins
        //
    ,   "domReady"    : "../lib/require/domReady"
    ,   "text"        : "../lib/require/text"
    ,   "lazyRequire" : "../lib/require/lazyRequire"
    }
});

require(
[
    "jquery"
,   "lazyRequire"
,   "utils"
,   "domReady!"
],
function( $, lazyRequire, utils )
{   
    var theApp = window[ "imageCreator" ] = 
        {
            engine  : ""
        ,   toolbar : {}
        }
    ,   mouse  = {}

    ,   $ecardBuilder  = null
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

    ,   toolbar : [ "layers", "image", "text", "info" ]

    }, theApp.settings );

    $( document ).ready( function()
    {
        $ecardBuilder  = $( ".ecardBuilder" );
        $ecardViewport = $( ".ecardViewport" );

        // Set viewport events.
        //
        $ecardViewport.mousedown( viewportDragStart );

        // Set engine precedence.
        //
        settings.engine.sort( function( engineA, engineB )
        {
            return engineA.order - engineB.order;
        });

        $.each( settings.engine || [], loadEngine );

        $ecardBuilder.bind( "loadEngine", loadEngine );

        // Create toolbar.
        //
        $.each( settings.toolbar || [], loadTool );

        $ecardBuilder.bind( "loadTool", loadTool );
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

        $( "<link/>", { type: "text/css", rel: "stylesheet", href: "toolbar/" + toolName + "/" + toolName + ".css" }).appendTo( "head" );
  
        requireOnce(
            [
                "toolbar/" + toolName + "/" + toolName
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
        if( $( event.target ).hasClass( "direction" ) ) 
        {
            return false;
        }

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

        $ecardBuilder.trigger( "viewportMove", delta );

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        return false;      
    }

} );