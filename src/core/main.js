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

    ,   "hammer"      : "../lib/hammer"
    }
});

require(
[
    "config"
,   "lazyRequire"
,   "utils"
,   "selection"
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
        $imageCreatorViewport.hammer({
            prevent_default   : true
        ,   scale_treshold    : 0
        ,   drag_min_distance : 0
        });
        
        $imageCreatorViewport.bind( "dragstart", viewportDragStart );
        $imageCreatorViewport.bind( "drag", viewportDrag );
        $imageCreatorViewport.bind( "dragend", viewportDragEnd );
        $imageCreatorViewport.bind( "transformstart", viewportPinchStart );
        $imageCreatorViewport.bind( "transform", viewportPinch );
        $imageCreatorViewport.bind( "transformend", viewportPinchEnd );
        $imageCreatorViewport.bind( "setMessage", function( events, options ){ setMessage( options ) });
        $imageCreatorMessageClose.bind( "tap", function(){ $imageCreatorMessage.hide(); });

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

        var target = event.originalEvent.touches && event.originalEvent.touches[0] || event.originalEvent;
        mouse.x = target.clientX;
        mouse.y = target.clientY; 

        $( "body" ).addClass( "noSelect" );
    }

    function viewportDrag( event )
    {
        event.preventDefault();

        var target = event.originalEvent.touches && event.originalEvent.touches[0] || event.originalEvent
        ,   delta  = 
        {
            x : target.clientX - mouse.x
        ,   y : target.clientY - mouse.y
        };

        $imageCreatorViewport.trigger( "viewportMove", delta );

        mouse.x = target.clientX;
        mouse.y = target.clientY;
    }

    function viewportDragEnd( event )
    {
        event.preventDefault();

        $( "body" ).removeClass( "noSelect" );
    }

    function viewportPinchStart( event )
    {
        event.preventDefault();

        pinch.scale  = event.scale;
        pinch.rotate = event.rotation; 
    }

    function viewportPinch( event )
    {
        event.preventDefault();

        var delta = 
        {
            scale  : event.scale    - pinch.scale
        ,   rotate : event.rotation - pinch.rotate
        }

        $imageCreatorViewport.trigger( "viewportPinch", [ delta ] );

        pinch.scale  = event.scale;
        pinch.rotate = event.rotation;
    }

    function viewportPinchEnd( event )
    {

    }
} );