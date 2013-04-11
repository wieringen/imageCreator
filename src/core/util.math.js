/**
 * @description <p>A collection of reusable utility functions.</p>
 *
 * @namespace imageCreator
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
define(
[],
function()
{
    var module = {};

    module.sanitizeRadians = function( radians )
    {
        var max = 2 * Math.PI;
        return radians < 0 ? max + radians : ( radians > max ? radians - max : radians );
    };

    module.toRadians = function( degrees )
    {
        return degrees * ( Math.PI / 180 );
    };

    module.toDegrees = function( radians )
    {
        return radians * 180 / Math.PI;
    };
    
    module.getBoundingBox = function( sizeUnrotated, rotation )
    {
        var sin = Math.abs( rotation.sin )
        ,   cos = Math.abs( rotation.cos )
        ;
        
        return { 
            width  : sizeUnrotated.height * sin + sizeUnrotated.width * cos
        ,   height : sizeUnrotated.height * cos + sizeUnrotated.width * sin
        };
    };

    module.getMatrix = function( rotation, scale, position, sizeReal ) 
    {
        var sin = scale * rotation.sin
        ,   cos = scale * rotation.cos

        // Translate origin to center of layer.
        //
        ,   matrixPre =
            [
                1, 0, scale * ( sizeReal.width / 2 ),
                0, 1, scale * ( sizeReal.height / 2 ),
                0, 0, 1
            ]
        
        // Scale, rotate and translate to the layers position.
        //
        ,   matrix =
            [
                cos, -sin, position.x,
                sin,  cos, position.y,
                0,    0,   1
            ]
        
        // Translate origin back to top left of layer.
        //
         ,  matrixPost =
            [
                1, 0, -( sizeReal.width  / 2 ),
                0, 1, -( sizeReal.height / 2 ),
                0, 0, 1
            ]
        ;

        return module.matrixMultiply( matrixPre, module.matrixMultiply( matrix, matrixPost ) );
    };

    module.matrixMultiply = function( a, b ) 
    {
        // Cache matrix values.
        //
        var a0 = a[0], a1 = a[1], a2 = a[2]
        ,   a3 = a[3], a4 = a[4], a5 = a[5]
        ,   a6 = a[6], a7 = a[7], a8 = a[8]
        ,   b0 = b[0], b1 = b[1], b2 = b[2]
        ,   b3 = b[3], b4 = b[4], b5 = b[5]
        ,   b6 = b[6], b7 = b[7], b8 = b[8]
        ;

        // Multiply matrixes.
        //
        return [
            a0 * b0 + a1 * b3 + a2 * b6
        ,   a0 * b1 + a1 * b4 + a2 * b7
        ,   a0 * b2 + a1 * b5 + a2 * b8

        ,   a3 * b0 + a4 * b3 + a5 * b6
        ,   a3 * b1 + a4 * b4 + a5 * b7
        ,   a3 * b2 + a4 * b5 + a5 * b8

        ,   a6 * b0 + a7 * b3 + a8 * b6
        ,   a6 * b1 + a7 * b4 + a8 * b7
        ,   a6 * b2 + a7 * b5 + a8 * b8
        ];
    };

    module.getDistance = function( pos1, pos2 )
    {
        var x = pos2.x - pos1.x
        ,   y = pos2.y - pos1.y
        ;
        
        return Math.sqrt((x * x) + (y * y));
    };
    
    module.getRandomInt = function( min, max )
    {
      return Math.floor( Math.random() * (max - min + 1) ) + min;
    };
  
    module.isPointInPath = function( mouse, size, position, radians )
    {
        var dx    = mouse.x - ( position.x + ( size.width / 2 ) )
        ,   dy    = mouse.y - ( position.y + ( size.height / 2 ) )
        ,   h1    = Math.sqrt( dx * dx + dy * dy )
        ,   currA = Math.atan2( dy, dx )
        ,   newA  = currA - radians

        ,   x2    = Math.cos(newA) * h1
        ,   y2    = Math.sin(newA) * h1
        ;

        if ( x2 > -0.5 * size.width && x2 < 0.5 * size.width && y2 > -0.5 * size.height && y2 < 0.5 * size.height )
        {
            return true;
        }
    }

    return module;
});