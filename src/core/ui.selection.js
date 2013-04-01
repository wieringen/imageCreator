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
],
function( config, cache, utilMath )
{
    var module = 
        {
            options : config.options.ui.selection
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas
    ,   $imageCreatorSelection
    ,   $imageCreatorSelectionTextEdit

    ,   mouse = 
        {
            x : 0
        ,   y : 0
        }
    ,   pinch = 
        { 
            scale  : 1
        ,   rotate : 0
        } 
    ,   shiftKeyEnabled = false
    ,   editing = false
    ;

    module.initialize = function()
    {
        // Get basic app DOM elements.
        //
        $imageCreatorViewport  = $( ".imageCreatorViewport" );
        $imageCreatorSelection = $( ".imageCreatorSelection" );
        $imageCreatorSelectionTextEdit = $( ".imageCreatorSelectionTextEdit" );

        // Listen for global app events.
        //
        $.subscribe( "layerUpdate", selectionPosition );
        $.subscribe( "layerSelect", selectionPosition );
        $.subscribe( "layerVisibility", selectionVisibility );  
        $.subscribe( "layerEdit", selectionSetEditing );

        // Set selection viewport events
        //
        $( document ).hammer({
            scale_treshold    : 0
        ,   drag_min_distance : 0
        });

        $imageCreatorViewport.bind( "dragstart", selectionDragStart );
        $imageCreatorViewport.bind( "drag", selectionDrag );
        $imageCreatorViewport.bind( "dragend", selectionDragEnd );
        $imageCreatorViewport.bind( "transformstart", selectionPinchStart );
        $imageCreatorViewport.bind( "transform", selectionPinch );
        $imageCreatorViewport.bind( "transformend", selectionPinchEnd );
        $imageCreatorViewport.bind( "tap", selectionSetEditing );
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

        selectionCreate();
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

            $gripClone.find( ".gripScale" ).css( "cursor", grip.toLowerCase() + "-resize" );

            $imageCreatorSelection.append( $gripClone );
        });
    }

    function selectionPosition( event, layer )
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
                ,   "color"      : layer.color
                ,   "display"    : "block"
                ,   "lineHeight" : Math.floor( layer.fontSize * layer.lineHeight ) + "px"
                ,   "fontSize"   : layer.fontSize
                ,   "fontFamily" : layer.font
                ,   "-webkit-transform" : 'rotate(' + layer.rotation.degrees + 'deg )'
                });  
            }
        }

        $imageCreatorSelection.toggle( layer && layer.visible && ! layer.locked );
    }

    function selectionSetEditing( event, state )
    {
        var layer = cache.getLayerActive();

        if( state )
        {
            selectionEnableEditing( event, layer );
        }
        else
        {
            selectionDisableEditing( event );
        }
    }

    function selectionDisableEditing( event, layer )
    {
        if( editing && event.target !== $imageCreatorSelectionTextEdit[0] )
        {
            editing = false;

            $imageCreatorSelection.removeClass( "editing" );
            $imageCreatorSelectionTextEdit.hide();

            $.publish( "layerEdit.engine" );
        }
    }

    function selectionEnableEditing( event, layer, state )
    {
        if( layer.type === "text" )
        {
            editing = true;

            $imageCreatorSelectionTextEdit.val( layer.text );

            $imageCreatorSelection.addClass( "editing" );

            selectionPosition( event, layer );

            $imageCreatorSelectionTextEdit.focus();
        }
    }

    function selectionSetText()
    {
        var layerCurrent = cache.getLayerActive();

        layerCurrent.setText( this.value );

        $.publish( "layerUpdate", [ layerCurrent ] );       
    }

    function selectionVisibility( event, layer )
    { 
        if( layer.selected && ! layer.locked )
        {
            $imageCreatorSelection.toggle( layer.visible );
            $imageCreatorSelectionTextEdit.toggle( layer.visible );
        }
    }

    function selectionScale( event )
    {
        var layerCurrent = cache.getLayerActive()
        ,   gripPositionStart = 
            {
                x : event.pageX - $imageCreatorSelection.offset().left - ( $imageCreatorSelection.width() / 2 )
            ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( $imageCreatorSelection.height() / 2 )
            }
        ,   distance = 0
        ;

        $( "body" ).addClass( "noSelect" );

        $( document ).bind( "mousemove.selection", function( event )
        {
            var gripPositionNow = 
                {
                    x : event.pageX - $imageCreatorSelection.offset().left - ( $imageCreatorSelection.width() / 2 )
                ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( $imageCreatorSelection.height() / 2 )
                }
            ,   distanceNow   = utilMath.getDistance( gripPositionStart, gripPositionNow )
            ,   distanceDelta = ( distanceNow - distance ) / 200
            ;

            $imageCreatorSelection.trigger( "onScale", [ layerCurrent.scale + distanceDelta, true ] );

            distance = distanceNow;
        });

        $( document ).bind( "mouseup.selection", function( event )
        {
            $( document ).unbind( ".selection" );
            $( "body" ).removeClass( "noSelect" );

            return false;
        });

        return false;
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

    function selectionRotate( event )
    {
        event.preventDefault();

        var layerRotationStart      = cache.getLayerActive().rotation.radians
        ,   gripPositionCenterStart = 
            {
                x : event.pageX - $imageCreatorSelection.offset().left - ( $imageCreatorSelection.width()  / 2 )
            ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( $imageCreatorSelection.height() / 2 )
            }
        ,   gripOffsetRadians = utilMath.sanitizeRadians( Math.atan2( gripPositionCenterStart.x, -gripPositionCenterStart.y ) )
        ,   slice = Math.PI * 2 / module.options.grips.length;
        ;

        $( "html" ).addClass( "noSelect cursorRotate" );

        $( document ).bind( "mousemove.selection", function( event )
        {
            event.preventDefault();

            var gripPositionCenter = 
            {
                x : event.pageX - $imageCreatorSelection.offset().left - ( $imageCreatorSelection.width() / 2 )
            ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( $imageCreatorSelection.height() / 2 )
            }
            ,   radians = utilMath.sanitizeRadians( layerRotationStart + utilMath.sanitizeRadians( Math.atan2( gripPositionCenter.x, -gripPositionCenter.y ) ) - gripOffsetRadians )
            ;

            if( shiftKeyEnabled )
            {
                radians = Math.round( radians * 1000 / ( slice * 1000 ) ) * slice;
            }

            var rotation = 
            {
                radians : radians
            ,   degrees : Math.round( utilMath.toDegrees( radians ) )
            ,   sin     : Math.sin( radians )
            ,   cos     : Math.cos( radians )
            };

            $imageCreatorSelection.trigger( "onRotate", [ rotation, true ] );
        });

        $( document ).bind( "mouseup.selection", function( event )
        {
            $( document ).unbind( ".selection" );
            $( "html" ).removeClass( "noSelect cursorRotate" );

            return false;
        });

        return false;
    }

    function selectionDragStart( event )
    {
        event.preventDefault();

        mouse.x = event.gesture && event.gesture.deltaX || 0;
        mouse.y = event.gesture && event.gesture.deltaY || 0;

        $( "html" ).addClass( "noSelect" );

        event.gesture && event.gesture.preventDefault();
    }

    function selectionDrag( event )
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

        $( "html" ).addClass( "cursorGrabbing" );

        if( ! editing )
        {
            $.publish( "viewportMove", [ delta ] );
        }

        mouse.x = event.gesture && event.gesture.deltaX || 0;
        mouse.y = event.gesture && event.gesture.deltaY || 0;  
    }

    function selectionDragEnd( event )
    {
        $( "html" ).removeClass( "noSelect cursorGrabbing" );
    }

    function selectionPinchStart( event )
    {
        event.gesture.preventDefault();

        pinch.scale  = event.gesture.scale;
        pinch.rotate = event.gesture.rotation; 
    }

    function selectionPinch( event )
    {
        event.gesture.preventDefault();

        var delta = 
        {
            scale  : event.gesture.scale    - pinch.scale
        ,   rotate : event.gesture.rotation - pinch.rotate
        }

        if( ! editing )
        {
            $.publish( "viewportPinch", [ delta ] );
        }
        
        pinch.scale  = event.gesture.scale;
        pinch.rotate = event.gesture.rotation;
    }

    function selectionPinchEnd( event )
    {

    }

    return module;
});