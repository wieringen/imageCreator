/**
 * @description 
 *
 * @namespace
 * @name controller
 * @version 1.0
 * @author mbaijs
 */
;( function( $, context, appName )
{
    var theApp   = $.getAndCreateContext( appName, context )
    ,   services = $.getAndCreateContext( "services", theApp )

    ,   mouse    = {}  

    ,   $ecardBuilder  = null
    ,   $ecardViewport = null
    ;

    theApp.toolbar = {};

    var settings = theApp.settings = $.extend(
    {
        viewportWidth  : 520
    ,   viewportHeight : 360
 
    ,   enginePath     : "core/engine/"

    ,   engine : 
        [ 
            {
                name    : "SVG"
            ,   order   : 1
            }
        ,   {
                name    : "Canvas"            
            ,   order   : 2
            }
        ,   {
                name    : "VML"
            ,   order   : 3
            }
        ]

    ,   toolbar :
        [
            {
                name           : "image"
            ,   target         : ".ecardToolbarBottom"
            ,   imageDownScale : 3
            ,   imageZoomScale : [ 30, 300 ]
            }

        ,   {
                name           : "text"
            ,   target         : ".ecardToolbarBottom"
            ,   textSizeScale  : [ 10, 100 ]
            ,   font           : "Arial"
            }

        ,   {
                name           : "info"
            ,   target         : ".ecardToolbarRight"
            }

        ,   {
                name           : "layers"
            ,   target         : ".ecardToolbarRight"
            }                    
        ]

    }, theApp.settings );

    $( document ).ready( function()
    {
        $ecardBuilder  = $( ".ecardBuilder" );
        $ecardViewport = $( ".ecardViewport" );

        // Set viewport events.
        //
        $ecardViewport.mousedown( viewportDragStart );

        //  Set engine precedence
        //
        settings.engine.sort( function( engineA, engineB )
        {
            return engineA.order - engineB.order;
        });

        $.each( settings.engine || [], loadEngine );

        $ecardBuilder.bind( "loadEngine", loadEngine );

        //  Create toolbar
        //
        $.each( settings.toolbar || [], loadTool );

        $ecardBuilder.bind( "loadTool", loadTool );
    } );

    theApp.supportEngine = function( engineName )
    {
        var engineTests = 
        {
            SVG     :   function()
                        {
                            return !!document.createElementNS && !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect;
                        }
        ,   Canvas  :   function()
                        {
                            return !!document.createElement("canvas").getContext;
                        }
        ,   VML     :   function()
                        {
                            return "object" === typeof document.namespaces;
                        }
        };

        if( engineTests.hasOwnProperty( engineName ) )
        {
            return engineTests[ engineName ]();
        }
        else
        {
            return false;
        }
    };

    function loadEngine( event, engineObject )
    {
        if( theApp.supportEngine( engineObject.name ) || ( "function" === typeof engineObject.support && engineObject.support() ) )
        {
            $.getScript( settings.enginePath + engineObject.name.toLowerCase() + ".js", function( data ) 
            {
                theApp.engine.initialize();
            });

            return false;
        }
        else
        {
            alert( engineObject.name + " is not supported in your browser!" );
        }
    }

    function loadTool( event, toolOptions )
    {
        $( "<link/>", { rel: "stylesheet", href: "toolbar/" + toolOptions.name + "/" + toolOptions.name + ".css" }).appendTo( "head" );

        $.ajax({
                url     : "toolbar/" + toolOptions.name + "/" + toolOptions.name + ".html"
            ,   success : function( html ) 
                {
                    $( toolOptions.target ).append( html );
                    
                    $.getScript( "toolbar/" + toolOptions.name + "/" + toolOptions.name + ".js", function( data ) 
                    {
                        theApp.toolbar[ toolOptions.name ].initialize( toolOptions );
                    });
                }
        });
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

        $ecardBuilder.trigger( "viewportMove", delta );

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        return false;      
    }
    

} )( jQuery, window, "ecardBuilder" );