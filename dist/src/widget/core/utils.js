/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace
 * @name one.apps.onePlaceApp.utils
 * @version 1.0
 * @author adebree, mdoeswijk
 */
 ( function( $, context, appName )
 {
    var theApp   = $.getAndCreateContext( appName, context )
    ,   utils    = $.getAndCreateContext( "utils", theApp )
    ;

    utils.toRadians = function( degrees )
    {
        return degrees * ( Math.PI / 180 );
    };

    utils.toDegrees = function( radians )
    {
        return radians * 180 / Math.PI;
    };
   
    utils.getBoundingBox = function( sizeUnrotated, rotation )
    {
        var sin = Math.sin( utils.toRadians( rotation ) )
        ,   cos = Math.cos( utils.toRadians( rotation ) )
        ;

        return { 
            width  : Math.round( sizeUnrotated.height * Math.abs(sin) + sizeUnrotated.width * Math.abs(cos) )
        ,   height : Math.round( sizeUnrotated.height * Math.abs(cos) + sizeUnrotated.width * Math.abs(sin) )
        };
    };
} )( jQuery, window, "ecardBuilder" );