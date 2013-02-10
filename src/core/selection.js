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
    "utils"
],
function( utils )
{
    var module =
        {
            name     : "selection"
        ,   settings : 
            {
                offsetWidth : 2
            ,   grips : 
                [
                    { 
                        "name"       : "N"
                    ,   "position"   : [ 50, 0 ]
                    ,   "positive"   : [ true, true ]
                    ,   "compensate" : [ true, true ]
                    }
                ,   { 
                        "name"       : "NE" 
                    ,   "position"   : [ 100, 0 ]
                    ,   "positive"   : [ false, true ]
                    ,   "compensate" : [ false, true ]                  
                    }     
                ,   { 
                        "name"       : "E"
                    ,   "position"   : [ 100, 50 ] 
                    ,   "positive"   : [ false, true ]
                    ,   "compensate" : [ false, false ]                
                    }
                ,   { 
                        "name"       : "SE" 
                    ,   "position"   : [ 100, 100 ] 
                    ,   "positive"   : [ false, false ]
                    ,   "compensate" : [ false, false ]                 
                    }
                ,   { 
                        "name"       : "S" 
                    ,   "position"   : [ 50, 100 ]
                    ,   "positive"   : [ true, false ]
                    ,   "compensate" : [ false, false ]                
                    }
                ,   { 
                        "name"       : "SW" 
                    ,   "position"   : [ 0, 100 ] 
                    ,   "positive"   : [ true, false ]
                    ,   "compensate" : [ true, false ]
                    }
                ,   { 
                        "name"       : "W"
                    ,   "position"   : [ 0, 50 ]     
                    ,   "positive"   : [ true, true ]
                    ,   "compensate" : [ true, true ]
                    }
                ,   {   
                        "name"       : "NW" 
                    ,   "position"   : [ 0, 0 ] 
                    ,   "positive"   : [ true, true ]
                    ,   "compensate" : [ true, true ]
                    }
                ]  
            }
        }

    ,   $imageCreatorViewport
    ,   $imageCreatorCanvas
    ,   $imageCreatorSelection

    ,   mouse = {}

    ,   layerCurrent
    ;

    module.initialize = function( )
    {
        // Get basic app DOM elements.
        //
        $imageCreatorViewport  = $( ".imageCreatorViewport" );
        $imageCreatorSelection = $( ".imageCreatorSelection" );

        // Listen to global app events.
        //
        $imageCreatorViewport.bind( "layerUpdate", selectionPosition );
        $imageCreatorViewport.bind( "layerSelect", selectionPosition );
        $imageCreatorViewport.bind( "layerVisibility", selectionVisibility );  
        
        // Set grip events.
        //
        $imageCreatorSelection.delegate( ".gripResize", "mousedown", selectionResize );
        $imageCreatorSelection.delegate( ".gripRotate", "mousedown", selectionRotate );

        selectionCreate();
    };

    function selectionCreate()
    {
        var _self = this
        ,   $grip = $( "<div class='grip gripRotate'><div class='gripResize'></div></div>")
        ;

        $.each( module.settings.grips, function( gripIndex, grip )
        {
            var $gripClone = $grip.clone();
            
            $gripClone.addClass( "grip" + grip.name );
            
            $gripClone.data( "grip", grip );

            $gripClone.css({
                "left" : grip.position[0] + "%"
            ,   "top"  : grip.position[1] + "%"
            });
            
            $gripClone.find( ".gripResize" ).css( "cursor", grip.name.toLowerCase() + "-resize" );

            $imageCreatorSelection.append( $gripClone );
        });
    }

    function selectionPosition( event, layer )
    { 
        layerCurrent = layer;
        
        if( layerCurrent )
        {
            $imageCreatorSelection.css({
                    "left"    : layer.positionRotated.x  - module.settings.offsetWidth
                ,   "top"     : layer.positionRotated.y  - module.settings.offsetWidth
                ,   "width"   : layer.sizeRotated.width  + module.settings.offsetWidth
                ,   "height"  : layer.sizeRotated.height + module.settings.offsetWidth
            });
        }
   
        $imageCreatorSelection.toggle( layerCurrent && layerCurrent.visible && ! layerCurrent.locked );
    }

    function selectionVisibility( event, layer )
    { 
        if( layer.selected && ! layer.locked )
        {
            $imageCreatorSelection.toggle( layer.visible );
        }
    }

    /**
     * calculate the scale size between two fingers
     * @param   object  pos_start
     * @param   object  pos_move
     * @return  float   scale
     */
    function calculateScale( positionStart, positionMove )
    {
        var startDistance = utils.getDistance( positionStart[0], positionStart[1] )
        ,   endDistance   = utils.getDistance( positionMove[0],  positionMove[1]  )
        ;
        
        return endDistance / startDistance;
    }

    function selectionResize( event )
    {
        var grip        = $( this ).parent().data( "grip")
        ,   delta       = { x: 0, y: 0 }
        ,   layerSize   =
            {
                width  : layerCurrent.sizeCurrent.width
            ,   height : layerCurrent.sizeCurrent.height
            }
        ,   layerPosition =
            {
                x : layerCurrent.position.x
            ,   y : layerCurrent.position.y
            };

        mouse.x = event.clientX;
        mouse.y = event.clientY;

        $( "body" ).addClass( "noSelect" );

        $( document ).mousemove( function( event )
        {
            delta.x += event.clientX - mouse.x;
            delta.y += event.clientY - mouse.y;
/*

STILL UNDER CONSTRUCTION THIS PART
            if( grip.name === "N" )
            {
                layerCurrent.sizeCurrent.height = layerSize.height - delta.y;
                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );
                layerCurrent.position.y = layerPosition.y + delta.y;
            }
            if( grip.name === "NE" )
            {
                layerCurrent.sizeCurrent.width  = layerSize.width  + delta.x;
                layerCurrent.sizeCurrent.height = layerSize.height - delta.y;

                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

                layerCurrent.position.y = layerPosition.y + delta.y;
            }
            if( grip.name === "E" )
            {
                layerCurrent.sizeCurrent.width = layerSize.width + delta.x;
                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );
            }
            if( grip.name === "SE" )
            {
                layerCurrent.sizeCurrent.width  = layerSize.width  + delta.x;
                layerCurrent.sizeCurrent.height = layerSize.height + delta.y;

                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );
            }
            if( grip.name === "S" )
            {
                layerCurrent.sizeCurrent.height = layerSize.height + delta.y;
                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );
            }
            if( grip.name === "SW" )
            {
                layerCurrent.sizeCurrent.width  = layerSize.width  - delta.x;
                layerCurrent.sizeCurrent.height = layerSize.height + delta.y;

                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

                layerCurrent.position.x = layerPosition.x + delta.x;
            }
            if( grip.name === "W" )
            {
                layerCurrent.sizeCurrent.width = layerSize.width - delta.x;
                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

                layerCurrent.position.x = layerPosition.x + delta.x;
            }
            if( grip.name === "NW" )
            {
                layerCurrent.sizeCurrent.width  = layerSize.width  - delta.x;
                layerCurrent.sizeCurrent.height = layerSize.height - delta.y;

                layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

                layerCurrent.position.x = layerPosition.x + delta.x;
                layerCurrent.position.y = layerPosition.y + delta.y;
            }

            layerCurrent.offset.x = Math.round( ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2 );
            layerCurrent.offset.y = Math.round( ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.positionRotated.x = layerCurrent.position.x - layerCurrent.offset.x;
            layerCurrent.positionRotated.y = layerCurrent.position.y - layerCurrent.offset.y;

            if( layerCurrent.type === "text")
            {
                        layerCurrent.matrix = utils.getMatrix( layerCurrent.rotation, 1, layerCurrent.position, layerCurrent.sizeCurrent );
            }else{
                        layerCurrent.matrix = utils.getMatrix( layerCurrent.rotation, layerCurrent.scale, layerCurrent.position, layerCurrent.sizeReal );
            }

            mouse.x = event.clientX;
            mouse.y = event.clientY;

            $imageCreator.trigger( "layerUpdate", [ layerCurrent ] );
*/
            //$selection.trigger( "onResize", [ rotation ] );
        });

        $( document ).mouseup( function( event )
        {
            $( document ).unbind( "mousemove" );
            $( document ).unbind( "mouseup" );
            $( "body" ).removeClass( "noSelect" );

            return false;
        });

        return false;
    } 

   function selectionScale( event )
    {
        var grip              = $( this ).data( "grip" )
        ,   gripPositionStart = 
            {
                x : event.pageX - $imageCreatorSelection.offset().left
            ,   y : event.pageY - $imageCreatorSelection.offset().top
            }
        ,   scaleStart = 0
        ;

        $( "body" ).addClass( "noSelect" );

        $( document ).mousemove( function( event )
        {
            var gripPositionCenter = 
                {
                    x : event.pageX - $imageCreatorSelection.offset().left - ( $imageCreatorSelection.width() / 2 )
                ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( $imageCreatorSelection.height() / 2 )
                }
            ,   distanceMove = utils.getDistance
            ,   scaleDelta   = 0
            ;

            $imageCreatorSelection.trigger( "onScale", [ scale ] );
        });

        $( document ).mouseup( function( event )
        {
            $( document ).unbind( "mousemove" );
            $( document ).unbind( "mouseup" );
            $( "body" ).removeClass( "noSelect" );

            return false;
        });

        return false;
    }


    function selectionRotate( event )
    {
        var grip                    = $( this ).data( "grip" )
        ,   layerRotationStart      = layerCurrent.rotation.radians
        ,   gripPositionCenterStart = 
            {
                x : event.pageX - $imageCreatorSelection.offset().left - ( $imageCreatorSelection.width()  / 2 )
            ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( $imageCreatorSelection.height() / 2 )
            }
        ,   gripOffsetRadians = utils.sanitizeRadians( Math.atan2( gripPositionCenterStart.x, -gripPositionCenterStart.y ) )
        ;

        $( "body" ).addClass( "noSelect" );

        $( document ).mousemove( function( event )
        {
            var gripPositionCenter = 
                {
                    x : event.pageX - $imageCreatorSelection.offset().left - ( $imageCreatorSelection.width() / 2 )
                ,   y : event.pageY - $imageCreatorSelection.offset().top  - ( $imageCreatorSelection.height() / 2 )
                }
            ,   radians  = utils.sanitizeRadians( layerRotationStart + utils.sanitizeRadians( Math.atan2( gripPositionCenter.x, -gripPositionCenter.y ) ) - gripOffsetRadians )
            ,   rotation = 
                {
                    radians : radians
                ,   degrees : Math.round( utils.toDegrees( radians ) )
                ,   sin     : Math.sin( radians )
                ,   cos     : Math.cos( radians )
                };

            $imageCreatorSelection.trigger( "onRotate", [ rotation ] );
        });

        $( document ).mouseup( function( event )
        {
            $( document ).unbind( "mousemove" );
            $( document ).unbind( "mouseup" );
            $( "body" ).removeClass( "noSelect" );

            return false;
        });

        return false;
    }

    return module;
});