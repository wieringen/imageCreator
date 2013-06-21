/**
 * @description
 *
 * @name ui.selection
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // Template.
    //
    "text!templates/selection.html"

    // Core.
    //
,   "config"
,   "cache"
,   "cs!util.math"
,   "util.detect"
],
function( moduleHTML, config, cache, utilMath, utilDetect )
{
    var module =
        {
            options : config.options.ui.selection
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas

    ,   $imageCreatorSelection

    ,   shiftKeyEnabled = false
    ,   editing         = false
    ,   editLock        = false
    ;

    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).append( moduleHTML );

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );
        $imageCreatorCanvas   = $( ".imageCreatorCanvas" );

        // Get module DOM elements.
        //
        $imageCreatorSelection = $( ".imageCreatorSelection" );

        // Listen to module UI events.
        //
        $imageCreatorCanvas.bind( "tap", selectionTap );
        $imageCreatorSelection.delegate( ".gripScale", "mousedown", selectionScale );
        $imageCreatorSelection.delegate( ".gripRotate", "mousedown", selectionRotate );
        $imageCreatorViewport.bind( "dragstart", selectionPosition );
        $imageCreatorViewport.bind( "transformstart", selectionPinch );
        $imageCreatorViewport.bind( "mousedown mousemove", function( event )
        {
            if( ! editLock ) event.preventDefault();
        });

        $( document ).bind( "keydown", selectionKeyDown );
        $( document ).bind( "keyup", selectionKeyUp );

        // Listen for global events.
        //
        $.subscribe( "layerUpdate", selectionUpdate );
        $.subscribe( "layerSelect", selectionSelect );
        $.subscribe( "layerEdit", selectionEdit );
        $.subscribe( "layerVisibility", selectionVisibility );

        // Populate the module UI.
        //
        populateUI();
    };

    function populateUI()
    {
        var _self = this
        ,   $grip = $( "<div class='grip gripRotate'><div class='gripScale'></div></div>")
        ;

        // Only create grips if we have mouse events.
        //
        if( ! utilDetect.NO_MOUSEEVENTS )
        {
            $.each( module.options.grips, function( gripIndex, grip )
            {
                var $gripClone = $grip.clone();

                $gripClone.addClass( "grip" + grip );
                $gripClone.data( "grip", grip );

                $gripClone.find( ".gripScale" ).css( "cursor", grip.toLowerCase() + "-resize" );

                $imageCreatorSelection.append( $gripClone );
            });
        }
    }

    function selectionSelect( event, layer )
    {
        selectionEdit( event, false );
        selectionUpdate( event, layer );
    }

    function selectionUpdate( event, layer )
    {
        if( layer )
        {
            $imageCreatorSelection.css({
                "left"    : layer.positionRotated.x  - module.options.offset
            ,   "top"     : layer.positionRotated.y  - module.options.offset
            ,   "width"   : layer.sizeRotated.width  + module.options.offset
            ,   "height"  : layer.sizeRotated.height + module.options.offset
            });
        }

        $imageCreatorSelection.toggle( layer && layer.visible && ! layer.locked );
    }

    function selectionEdit( event, layer )
    {
        $imageCreatorSelection.toggleClass( "editing", layer );

        if( layer )
        {
            editing  = true;
            editLock = layer.canHaveText;
        }
        else
        {
            editing = false;
            editLock = false;
        }
    }

    function selectionKeyDown( event )
    {
        if( event.shiftKey )
        {
            shiftKeyEnabled = true;
        }
    }

    function selectionKeyUp( event )
    {
        shiftKeyEnabled = false;
    }

    function selectionVisibility( event, layer )
    {
        if( layer.selected && ! layer.locked )
        {
            $imageCreatorSelection.toggle( layer.visible );
        }
    }

    function selectionScale( event )
    {
        var layerCurrent    = cache.getLayerActive()
        ,   layerScaleStart = layerCurrent.fontSize || layerCurrent.scale
        ,   gripName        = $( event.target ).parent().data( "grip" )
        ,   scaleSliceY     = 2 / ( layerCurrent.sizeRotated.height / layerScaleStart )
        ,   scaleSliceX     = 2 / ( layerCurrent.sizeRotated.width  / layerScaleStart )
        ,   mouse =
            {
                x : event.pageX
            ,   y : event.pageY
            }
        ,   deltaScale = 0
        ;

        $( "body" ).addClass( "noSelect" );

        // Mehhh....
        //
        $( document ).bind( "mousemove.selection", function( event )
        {
            var quantifierY = scaleSliceY * Math.abs( event.pageY - mouse.y )
            ,   quantifierX = scaleSliceX * Math.abs( event.pageX - mouse.x )
            ;

            if( gripName === "N" )
            {
                deltaScale = event.pageY > mouse.y ? ( deltaScale - quantifierY ) : ( deltaScale + quantifierY );
            }

            if( gripName === "NE" )
            {
            }

            if( gripName === "E" )
            {
                deltaScale = event.pageX > mouse.x ? ( deltaScale + quantifierX ) : ( deltaScale - quantifierX );
            }

            if( gripName === "SE" )
            {

            }

            if( gripName === "S" )
            {
                deltaScale = event.pageY > mouse.y ? ( deltaScale + quantifierY ) : ( deltaScale - quantifierY );
            }

            if( gripName === "SW" )
            {

            }

            if( gripName === "W" )
            {
                deltaScale = event.pageX > mouse.x ? ( deltaScale - quantifierX ) : ( deltaScale + quantifierX );
            }

            if( gripName === "NW" )
            {

            }

            if( layerCurrent.setFontSize )
            {
                layerCurrent.setFontSize( layerScaleStart + deltaScale );
            }
            else
            {
                layerCurrent.setScale( layerScaleStart + deltaScale );
            }

            mouse.x = event.pageX;
            mouse.y = event.pageY;

            $.publish( "layerUpdate", [ layerCurrent ] );
            $.publish( "selectionScale", [ layerCurrent.fontSize || layerCurrent.scale, true ] );
        });

        $( document ).bind( "mouseup.selection", function( event )
        {
            $( document ).unbind( ".selection" );
            $( "body" ).removeClass( "noSelect" );

            return false;
        });

        return false;
    }

    function selectionRotate( event )
    {
        event.preventDefault();

        var layerCurrent            = cache.getLayerActive()
        ,   layerStartRadians       = layerCurrent.rotation.radians
        ,   selectionOffset         = $imageCreatorSelection.offset()
        ,   gripPositionCenterStart =
            {
                x : event.pageX - selectionOffset.left - ( layerCurrent.sizeRotated.width  / 2 )
            ,   y : event.pageY - selectionOffset.top  - ( layerCurrent.sizeRotated.height / 2 )
            }
        ,   gripOffsetRadians = utilMath.sanitizeRadians( Math.atan2( gripPositionCenterStart.x, -gripPositionCenterStart.y ) )
        ,   slice             = Math.PI * 2 / module.options.grips.length
        ;

        $( "html" ).addClass( "noSelect cursorRotate" );

        $( document ).bind( "mousemove.selection", function( event )
        {
            event.preventDefault();

            var gripPositionCenter =
            {
                x : event.pageX - $imageCreatorSelection.offset().left - ( layerCurrent.sizeRotated.width  / 2 )
            ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( layerCurrent.sizeRotated.height / 2 )
            }
            ,   gripCurrentRadians = utilMath.sanitizeRadians( Math.atan2( gripPositionCenter.x, -gripPositionCenter.y ) )
            ,   radians = utilMath.sanitizeRadians( layerStartRadians + gripCurrentRadians - gripOffsetRadians )
            ;

            if( shiftKeyEnabled )
            {
                radians = Math.round( radians * 1000 / ( slice * 1000 ) ) * slice;
            }

            layerCurrent.setRotate(
            {
                radians : radians
            ,   degrees : utilMath.toDegrees( radians )
            ,   sin     : Math.sin( radians )
            ,   cos     : Math.cos( radians )
            } );

            $.publish( "layerUpdate", [ layerCurrent, true ] );
            $.publish( "selectionRotate", [ layerCurrent.rotation, true ] );
        });

        $( document ).bind( "mouseup.selection", function( event )
        {
            $( document ).unbind( ".selection" );
            $( "html" ).removeClass( "noSelect cursorRotate" );

            return false;
        });

        return false;
    }

    function selectionPosition( event )
    {
        event.gesture.preventDefault();

        var layerCurrent = cache.getLayerActive()
        ,   mouse =
            {
                x : event.gesture.deltaX
            ,   y : event.gesture.deltaY
            }
        ;

        $( "html" ).addClass( "noSelect cursorGrabbing" );

        $( document ).bind( "drag.selection", function( event )
        {
            if( ! editLock && layerCurrent && layerCurrent.visible )
            {
                layerCurrent.setPosition({
                    x : event.gesture.deltaX - mouse.x
                ,   y : event.gesture.deltaY - mouse.y
                });

                $.publish( "layerUpdate", [ layerCurrent, true ] );
            }

            mouse.x = event.gesture.deltaX;
            mouse.y = event.gesture.deltaY;
        });

        $( document ).bind( "dragend.selection", function( event )
        {
            $( document ).unbind( ".selection" );
            $( "html" ).removeClass( "noSelect cursorGrabbing" );

            return false;
        });
    }

    function selectionPinch( event )
    {
        event.gesture.preventDefault();

        var layerCurrent      = cache.getLayerActive()
        ,   layerRadiansStart = layerCurrent.rotation.radians
        ,   layerScaleStart   = layerCurrent.fontSize || layerCurrent.scale
        ,   deltaScale        = event.gesture.scale
        ,   multiplierScale   = layerCurrent.fontSize ? 20 : 0.75
        ;

        $( document ).bind( "transform.selection", function( event )
        {
            var radians  = utilMath.sanitizeRadians( layerRadiansStart + utilMath.toRadians( event.gesture.rotation ) )
            ,   rotation =
                {
                    radians : radians
                ,   degrees : utilMath.toDegrees( radians )
                ,   sin     : Math.sin( radians )
                ,   cos     : Math.cos( radians )
                }
            ,   scale = layerScaleStart + ( ( event.gesture.scale - deltaScale ) * multiplierScale )
            ;

            if( ! editLock && layerCurrent && layerCurrent.visible )
            {
                layerCurrent.setRotate( rotation );

                if( layerCurrent.setFontSize )
                {
                    layerCurrent.setFontSize( scale);
                }
                else
                {
                    layerCurrent.setScale(scale);
                }

                $.publish( "layerUpdate", [ layerCurrent ] );
                $.publish( "selectionRotate", [ layerCurrent.rotation, true ] );
                $.publish( "selectionScale", [ layerCurrent.fontSize || layerCurrent.scale, true ] );
            }

            return false;
        });

        $( document ).bind( "transformend.selection", function( event )
        {
            $( document ).unbind( ".selection" );

            return false;
        });
    }

    function selectionTap( event )
    {
        var layerActive = cache.getLayerActive()
        ,   offset      = $imageCreatorViewport.offset()
        ,   mouse       =
            {
                x : event.gesture.center.pageX - offset.left
            ,   y : event.gesture.center.pageY - offset.top
            }
        ,   layerFound  = false
        ;

        $.each( cache.getLayers(), function( index, layer )
        {
            if( layer.plane === "baseline" )
            {
                if( utilMath.isPointInPath( mouse, layer.sizeCurrent, layer.position, layer.rotation.radians ) )
                {
                    if( layerActive.id === layer.id )
                    {
                        $.publish( "layerEdit", [ layerActive ] );
                    }
                    else
                    {
                        cache.setLayerActiveByID( layer.id );
                    }

                    layerFound = true;
                }
            }
        });

        if( ! layerFound && editing )
        {
            $.publish( "layerEdit", [ false ] );
        }
    }

    return module;
});