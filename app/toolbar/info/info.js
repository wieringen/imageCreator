/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery",

    // Module HTML template.
    //
    "text!toolbar/info/info.html",

    // App core modules.
    //
    "utils",
],
function( $, moduleHTML, utils )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name     : "info"
        ,   target   : ".toolbarInfo"           
        ,   enabled  : true
        ,   settings : 
            {
            }
        }

    ,   $ecardBuilder
    ,   $module
    , 	$layerName
    ,	$layerRotationValue
    ,	$layerPositionXValue 
    ,	$layerPositionYValue
    ,   $layerSizeWidth
    ,   $layerSizeHeight

    // The curent layer that is being edited.
    //
    , 	layerCurrent = false
    ;

    module.initialize = function( options )
    {
        // Append module HTML.
        //
        $( module.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $ecardBuilder = $( ".ecardBuilder" );

        // Get module DOM elements.
        //
        $module              = $( ".toolbarInfo" );       
        $layerName           = $module.find( ".objectName" );
        $layerRotationValue  = $module.find( ".objectRotationValue" );
        $layerPositionXValue = $module.find( ".objectPositionXValue" );
        $layerPositionYValue = $module.find( ".objectPositionYValue" );
        $layerSizeWidth      = $module.find( ".objectSizeWidth" );
        $layerSizeHeight     = $module.find( ".objectSizeHeight" );

        // Listen to global app events.
        //
    	$ecardBuilder.bind( "layerSelect", infoUpdate );
    	$ecardBuilder.bind( "layerUpdate", infoUpdate );
    };

    function infoUpdate( event, layer )
    {
    	$layerName.text( layer.layerName || "" );
    	
        $layerRotationValue.text( layer.rotation.degrees );
    	
        $layerPositionXValue.text( layer.positionRotated && layer.positionRotated.x || 0 );
    	$layerPositionYValue.text( layer.positionRotated && layer.positionRotated.y || 0 );
        
        $layerSizeWidth.text( layer.sizeCurrent && layer.sizeCurrent.width || 0);
        $layerSizeHeight.text( layer.sizeCurrent && layer.sizeCurrent.height || 0 );
    }

    return module;
} );