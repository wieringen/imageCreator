/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
 ;( function( $, context, appName )
 {

    var theApp        = $.getAndCreateContext( appName, context )
    ,   utils         = $.getAndCreateContext( "utils", theApp )
    ,   info          = {}

    ,   settings      = {}
    ,	snippets      = {}

    ,   $ecardBuilder
    ,   $module
    , 	$layerName
    ,	$layerRotationValue
    ,	$layerPositionXValue 
    ,	$layerPositionYValue
    ,   $layerSizeWidth
    ,   $layerSizeHeight

    , 	layerCurrent = false
    ;

    theApp.toolbar.info = info;

    info.initialize = function( options )
    {
      	settings = options;

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
    	
        $layerRotationValue.text( layer.rotation || 0 );
    	
        $layerPositionXValue.text( layer.positionRotated && layer.positionRotated.x || 0 );
    	$layerPositionYValue.text( layer.positionRotated && layer.positionRotated.y || 0 );
        
        $layerSizeWidth.text( layer.sizeCurrent && layer.sizeCurrent.width || 0);
        $layerSizeHeight.text( layer.sizeCurrent && layer.sizeCurrent.height || 0 );
    }

} )( jQuery, window, "ecardBuilder" );