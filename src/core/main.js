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
    ,   "engine"      : "engine"
    ,   "toolbar"     : "toolbar"
    ,   "templates"   : "../templates"

        // Require plugins
        //
    ,   "lazyRequire" : "../lib/require/lazyRequire"
    ,   "text"        : "../lib/require/text"

    ,   "hammer"      : "../lib/jquery.hammer"
    ,   "pubsub"      : "../lib/jquery.pubsub"    
    }
});

require(
[
    "config"
,   "lazyRequire"
,   "utils"
,   "selection"
,   "pubsub"
,   "hammer"
],
function( config, lazyRequire, utils, selection )
{   
    var mouse   = {}
    ,   pinch   = 
        { 
            scale  : 1
        ,   rotate : 0
        }
    ,   toolbar = {}

    ,   $imageCreatorViewport
    ,   $imageCreatorIntro
    ,   $imageCreatorMessage
    ,   $imageCreatorMessageInner
    ,   $imageCreatorMessageClose
    ;

    $( document ).ready( function()
    {
        // Get basic app DOM elements.
        //
        $imageCreatorViewport      = $( ".imageCreatorViewport" );
        $imageCreatorIntro         = $( ".imageCreatorIntro" );
        $imageCreatorMessage       = $( ".imageCreatorMessage" );
        $imageCreatorMessageInner  = $( ".imageCreatorMessageInner" );
        $imageCreatorMessageClose  = $( ".imageCreatorMessageClose" );

        // Setup the layer resizer/rotater selection.
        //
        selection.initialize();

        // Set viewport events.
        //
        $( document ).hammer({
            scale_treshold    : 0
        ,   drag_min_distance : 0
        });
        
        $imageCreatorViewport.bind( "dragstart", viewportDragStart );
        $imageCreatorViewport.bind( "drag", viewportDrag );
        $imageCreatorViewport.bind( "dragend", viewportDragEnd );
        $imageCreatorViewport.bind( "transformstart", viewportPinchStart );
        $imageCreatorViewport.bind( "transform", viewportPinch );
        $imageCreatorViewport.bind( "transformend", viewportPinchEnd );
        $imageCreatorMessageClose.bind( "tap", function(){ $imageCreatorMessage.hide(); });
        $.pubsub( "subscribe", "setMessage", setMessage );

        // Create toolbar.
        //
        $.each( config.options.toolbar || [], loadTool );

        $.pubsub( "subscribe", "loadTool", function( event, toolName, toolOptions )
        { 
            loadTool( toolName, toolOptions );
        });

        // Load engine.
        //
        $.each( config.options.engineOrder || [], function( engineIndex, engineName )
        {
            return loadEngine( engineName );
        });

        $.pubsub( "subscribe", "loadEngine", function( event, engineName )
        { 
            loadEngine( engineName );
        });

        $imageCreatorViewport.bind( "layerSelect layerVisibility", function( event, layer )
        {
            $imageCreatorIntro.toggle( layer === false || ( !layer.visible && layer.selected ) );   
        });

    } );

    function setMessage( options )
    {
        var defaults = 
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

    function loadEngine( engineNane )
    {
        var engineObject = config.options.engines[ engineNane ];

        if( "function" === typeof engineObject.support && engineObject.support() )
        {
            setMessage( {
                "message" : "Loading " + engineNane + " engine..."
            ,   "status"  : "loading"
            ,   "fade"    : true
            }); 

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
            setMessage( {
                "message" : "Loading " + toolName + " tool..."
            ,   "status"  : "loading"
            ,   "fade"    : true
            }); 

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
        event.preventDefault();

        mouse.x = event.gesture && event.gesture.deltaX || 0;
        mouse.y = event.gesture && event.gesture.deltaY || 0;

        $( "body" ).addClass( "noSelect" );

        event.gesture && event.gesture.preventDefault();
    }

    function viewportDrag( event )
    {
        var delta = 
        {
            x : event.gesture && event.gesture.deltaX - mouse.x
        ,   y : event.gesture && event.gesture.deltaY - mouse.y
        };

        // temp fix until my hammer issue gets resolves
        //
        delta.x = isNaN(delta.x) ? 0 : delta.x;
        delta.y = isNaN(delta.y) ? 0 : delta.y;

        $.pubsub( "publish", "viewportMove", delta );

        mouse.x = event.gesture && event.gesture.deltaX || 0;
        mouse.y = event.gesture && event.gesture.deltaY || 0;  
    }

    function viewportDragEnd( event )
    {
        $( "body" ).removeClass( "noSelect" );
    }

    function viewportPinchStart( event )
    {
        event.gesture.preventDefault();

        pinch.scale  = event.gesture.scale;
        pinch.rotate = event.gesture.rotation; 
    }

    function viewportPinch( event )
    {
        event.gesture.preventDefault();

        var delta = 
        {
            scale  : event.gesture.scale    - pinch.scale
        ,   rotate : event.gesture.rotation - pinch.rotate
        }

        $.pubsub( "publish", "viewportPinch", delta );

        pinch.scale  = event.gesture.scale;
        pinch.rotate = event.gesture.rotation;
    }

    function viewportPinchEnd( event )
    {

    }
} );