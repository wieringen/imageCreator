/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace
 * @name info
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // Module HTML template.
    //
    "text!templates/info.html"

    // App core modules
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
    ,   $moduleTitle
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

    /**
      * @description Function that initializes the module. It will append the modules html, set the title and initializes its UI.
      *
      * @name module#initialize
      * @function
      *
      */
    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module              = $( ".imageCreatorToolInfo" );
        $moduleTitle         = $module.find( ".moduleTitle" );
        $layerName           = $module.find( ".objectName" );
        $layerRotationValue  = $module.find( ".objectRotationValue" );
        $layerPositionXValue = $module.find( ".objectPositionXValue" );
        $layerPositionYValue = $module.find( ".objectPositionYValue" );
        $layerSizeWidth      = $module.find( ".objectSizeWidth" );
        $layerSizeHeight     = $module.find( ".objectSizeHeight" );

        // Set module title.
        //
        $moduleTitle.text( module.options.title );

        // Listen to global app events.
        //
        $.subscribe( "layerSelect", infoUpdate );
        $.subscribe( "layerUpdate", infoUpdate );
    };

    /**
      * @description Function updates all the info fields with the current selected layer properties.
      *
      * @name infoUpdate
      * @function
      *
      */
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

            $layerRotationValue.text( layer.rotation && layer.rotation.degrees || 0 );
            
            $layerSizeWidth.text( layer.sizeCurrent && layer.sizeCurrent.width || 0 );
            $layerSizeHeight.text( layer.sizeCurrent && layer.sizeCurrent.height || 0 );
        }
    }

    return module;
} );