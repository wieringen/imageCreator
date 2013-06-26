/**
*
* @module info
*/

define(
[
    // Template.
    //
    "text!templates/info.html"

    // Core.
    //
,   "config"
],
function( moduleHTML, config )
{
    var module =
        {
            enabled  : true
        ,   options  : config.options.ui.info
        }

    ,   $imageCreatorViewport

    ,   $module
    ,   $layerName
    ,   $layerRotationValue
    ,   $layerPositionXValue
    ,   $layerPositionYValue
    ,   $layerSizeWidth
    ,   $layerSizeHeight

    // The curent layer that is being edited.
    //
    ,   layerCurrent = false
    ;

    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module              = $( module.options.target );
        $layerName           = $module.find( ".objectName" );
        $layerRotationValue  = $module.find( ".objectRotationValue" );
        $layerPositionXValue = $module.find( ".objectPositionXValue" );
        $layerPositionYValue = $module.find( ".objectPositionYValue" );
        $layerSizeWidth      = $module.find( ".objectSizeWidth" );
        $layerSizeHeight     = $module.find( ".objectSizeHeight" );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", infoUpdate );
        $.subscribe( "layerUpdate", infoUpdate );
    };

    function infoUpdate( event, layer, partial )
    {
        $layerPositionXValue.text( layer.positionRotated && Math.round( layer.positionRotated.x ) || 0 );
        $layerPositionYValue.text( layer.positionRotated && Math.round( layer.positionRotated.y ) || 0 );

        if( ! partial )
        {
            $layerName.text( layer.name ? layer.name : "" );

            // If the current selected layer is a text layer use its text value as the value for the info box name field.
            //
            if( layer.text )
            {
                $layerName.text( layer.text.replace( "<br/>", "" ) );
            }

            $layerRotationValue.text( layer.rotation && Math.round( layer.rotation.degrees ) || 0 );

            $layerSizeWidth.text( layer.sizeCurrent && Math.round( layer.sizeCurrent.width ) || 0 );
            $layerSizeHeight.text( layer.sizeCurrent && Math.round( layer.sizeCurrent.height ) || 0 );
        }
    }

    return module;
} );