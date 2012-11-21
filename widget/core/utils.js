/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace ecardBuilder
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
 ;( function( $, context, appName )
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
        var sin = Math.abs( Math.sin( utils.toRadians( rotation ) ) )
        ,   cos = Math.abs( Math.cos( utils.toRadians( rotation ) ) )
        ;

        return { 
            width  : Math.round( sizeUnrotated.height * sin + sizeUnrotated.width * cos )
        ,   height : Math.round( sizeUnrotated.height * cos + sizeUnrotated.width * sin )
        };
    };

    utils.getRectSizeInsideBoundingBox = function( sizeRotated, rotation )
    {
        var sin = Math.abs( Math.sin( utils.toRadians( rotation ) ) )
        ,   cos = Math.abs( Math.cos( utils.toRadians( rotation ) ) )
        ;

        return { 
            width  : Math.round( ( 1 / ( Math.pow( cos, 2 ) - Math.pow( sin, 2 ) ) ) * (   sizeRotated.width * cos - sizeRotated.height * sin ) )
        ,   height : Math.round( ( 1 / ( Math.pow( cos, 2 ) - Math.pow( sin, 2 ) ) ) * ( - sizeRotated.width * sin + sizeRotated.height * cos ) )
        };
    };

} )( jQuery, window, "ecardBuilder" );