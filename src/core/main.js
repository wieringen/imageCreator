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
requirejs.config(
{
    paths : 
    {
        // App paths
        //
        "plugins"     : "../lib"
    ,   "engine"      : "engine"
    ,   "toolbar"     : "toolbar"
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
,   "lazyRequire"
,   "utils"
,   "selection"
],
function( config, lazyRequire, utils, selection )
{   
    var mouse   = {}
    ,   toolbar = {}

    ,   $imageCreatorViewport
    ,   $imageCreatorIntro
    ;

    $( document ).ready( function()
    {
        // Get basic app DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );
        $imageCreatorIntro    = $( ".imageCreatorIntro" );

        // Setup the layer resizer/rotater selection.
        //
        selection.initialize();

        // Set viewport events.
        //
        $imageCreatorViewport.mousedown( viewportDragStart );

        // Create toolbar.
        //
        $.each( config.options.toolbar || [], loadTool );

        $imageCreatorViewport.bind( "loadTool", function( event, toolName, toolOptions )
        { 
            loadTool( toolName, toolOptions );
        });

        // Load engine.
        //
        $.each( config.options.engineOrder || [], function( engineIndex, engineName )
        {
            return loadEngine( engineName );
        });

        $imageCreatorViewport.bind( "loadEngine", function( event, engineName )
        { 
            loadEngine( engineName );
        });

        $imageCreatorViewport.bind( "layerSelect layerVisibility", function( event, layer )
        {
            $imageCreatorIntro.toggle( layer === false || ( !layer.visible && layer.selected ) );   
        });

    } );

    function loadEngine( engineNane )
    {
        var engineObject = config.options.engines[ engineNane ];

        if( "function" === typeof engineObject.support && engineObject.support() )
        {
            var requireOnce = lazyRequire.once();

            requireOnce(
                [
                    "engine/" + engineNane
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

    function loadTool( toolName, toolOptions )
    {
        if( config.options.toolbar[ toolName ] )
        {
            var requireOnce = lazyRequire.once();

            requireOnce(
                [
                    "toolbar/" + toolName
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

    function viewportDragStart( event )
    {
        mouse.x = event.clientX;
        mouse.y = event.clientY;

        $( "body" ).addClass( "noSelect" );

        $imageCreatorViewport.mousemove( viewportDragMove );

        $( document ).mouseup( function( event )
        {
            $( "body" ).removeClass( "noSelect" );

            $imageCreatorViewport.unbind( "mousemove" );
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

        $imageCreatorViewport.trigger( "viewportMove", delta );

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        return false;      
    }

} );