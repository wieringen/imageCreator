/**
 * @description A element cropper plugin.
 *
 * @name selection
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // App core modules
    //
    "config"
,   "cache"
,   "util.math"
,   "util.detect"
],
function( config, cache, utilMath, utilDetect )
{
    var module =
        {
            options : config.options.ui.selection
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas
    ,   $imageCreatorSelection
    ,   $imageCreatorSelectionTextEdit

    ,   shiftKeyEnabled = false
    ,   editing         = false
    ;

    module.initialize = function()
    {
        // Get basic app DOM elements.
        //
        $imageCreatorViewport          = $( ".imageCreatorViewport" );
        $imageCreatorCanvas            = $( ".imageCreatorCanvas" );
        $imageCreatorSelection         = $( ".imageCreatorSelection" );
        $imageCreatorSelectionTextEdit = $( ".imageCreatorSelectionTextEdit" );

        // Listen for global app events.
        //
        $.subscribe( "layerUpdate", selectionUpdate );
        $.subscribe( "layerSelect", selectionUpdate );
        $.subscribe( "layerVisibility", selectionVisibility );

        // Set selection viewport events
        //
        $( document ).hammer({
            scale_treshold    : 0
        ,   drag_min_distance : 0
        });

        $imageCreatorViewport.bind( "dragstart", selectionPosition );
        $imageCreatorViewport.bind( "transformstart", selectionPinch );
        $imageCreatorCanvas.bind( "tap", selectionTap );
        $imageCreatorViewport.bind( "mousedown mousemove", function( event )
        {
            if( ! editing ) event.preventDefault();
        });

        $( document ).bind( "keydown", selectionKeyDown );
        $( document ).bind( "keyup", selectionKeyUp );

        // Set selection grip events.
        //
        $imageCreatorSelection.delegate( ".gripScale", "mousedown", selectionScale );
        $imageCreatorSelection.delegate( ".gripRotate", "mousedown", selectionRotate );

        $imageCreatorSelectionTextEdit.bind( "change, keyup", selectionSetText );

        // Only create grips if we have mouse events.
        //
        if( ! utilDetect.NO_MOUSEEVENTS ) selectionCreate();
    };

    function selectionCreate()
    {
        var _self = this
        ,   $grip = $( "<div class='grip gripRotate'><div class='gripScale'></div></div>")
        ;

        $.each( module.options.grips, function( gripIndex, grip )
        {
            var $gripClone = $grip.clone();

            $gripClone.addClass( "grip" + grip );
            $gripClone.data( "grip", grip );

            $gripClone.find( ".gripScale" ).css( "cursor", grip.toLowerCase() + "-resize" );

            $imageCreatorSelection.append( $gripClone );
        });
    }

    function selectionUpdate( event, layer )
    {
        if( event.type === "layerSelect" )
        {
            selectionDisableEditing( event );
        }

        if( layer )
        {
            $imageCreatorSelection.css({
                "left"    : layer.positionRotated.x  - module.options.offset
            ,   "top"     : layer.positionRotated.y  - module.options.offset
            ,   "width"   : layer.sizeRotated.width  + module.options.offset
            ,   "height"  : layer.sizeRotated.height + module.options.offset
            });

            if( editing )
            {
                $imageCreatorSelectionTextEdit.css({
                    "width"      : layer.sizeCurrent.width
                ,   "height"     : layer.sizeCurrent.height
                ,   "left"       : layer.position.x
                ,   "top"        : layer.position.y
                ,   "display"    : "block"
                ,   "lineHeight" : Math.floor( layer.fontSize * layer.lineHeight ) + "px"
                ,   "fontSize"   : layer.fontSize
                ,   "fontFamily" : layer.font
                ,   "transform"  : "rotate(" + layer.rotation.degrees + "deg )"
                });
            }
        }

        $imageCreatorSelection.toggle( layer && layer.visible && ! layer.locked );
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
            $imageCreatorSelectionTextEdit.toggle( editing && layer.visible );
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
        ,   layerRotationStart      = layerCurrent.rotation.radians
        ,   selectionOffset         = $imageCreatorSelection.offset()
        ,   gripPositionCenterStart =
            {
                x : event.pageX - selectionOffset.left - ( layerCurrent.sizeRotated.width  / 2 )
            ,   y : event.pageY - selectionOffset.top  - ( layerCurrent.sizeRotated.height / 2 )
            }
        ,   gripOffsetRadians = utilMath.sanitizeRadians( Math.atan2( gripPositionCenterStart.x, -gripPositionCenterStart.y ) )
        ,   slice             = Math.PI * 2 / module.options.grips.length;
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
            ,   radians = utilMath.sanitizeRadians( layerRotationStart + utilMath.sanitizeRadians( Math.atan2( gripPositionCenter.x, -gripPositionCenter.y ) ) - gripOffsetRadians )
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
            if( ! editing && layerCurrent && layerCurrent.visible )
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
            ,   scale = layerScaleStart + ( ( event.gesture.scale - deltaScale ) * multiplierScale );
            ;

            if( ! editing && layerCurrent && layerCurrent.visible )
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
                    if( layerActive.id === layer.id && layerActive.editable )
                    {
                        selectionEnableEditing( event, layerActive );
                    }
                    else
                    {
                        cache.setLayerActiveByID( layer.id );
                    }

                    layerFound = true;

                    return false;
                }
            }
        });

        if( ! layerFound && editing )
        {
            selectionDisableEditing();
        }
    }

    function selectionDisableEditing( event )
    {
        if( editing )
        {
            editing = false;

            $imageCreatorSelection.removeClass( "editing" );
            $imageCreatorSelectionTextEdit.hide();
        }
    }

    function selectionEnableEditing( event, layerActive )
    {
        if( ! editing )
        {
            editing = true;

            $imageCreatorSelectionTextEdit.val( layerActive.text );

            $imageCreatorSelection.addClass( "editing" );

            selectionUpdate( event, layerActive );

            $imageCreatorSelectionTextEdit.focus();
        }
    }

    function selectionSetText()
    {
        var layerCurrent = cache.getLayerActive();

        layerCurrent.setText( this.value );

        $.publish( "layerUpdate", [ layerCurrent ] );
    }

    return module;
});