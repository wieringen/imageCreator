/**
 * @description <p>A collection of reusable utility functions. Exposed on the application context as 'utils'.</p>
 *
 * @namespace ecardBuilder
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery"
],
function( $ )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name     : "utils"
        ,   settings : 
            {
            }
        }
    ;

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

        return { 
            width  : Math.round( sizeUnrotated.height * sin + sizeUnrotated.width * cos )
        ,   height : Math.round( sizeUnrotated.height * cos + sizeUnrotated.width * sin )
        };
    };

    module.getRectSizeInsideBoundingBox = function( sizeRotated, rotation )
    {
        var sin = Math.abs( rotation.sin )
        ,   cos = Math.abs( rotation.cos )
        ;

        return { 
            width  : Math.round( ( 1 / ( Math.pow( cos, 2 ) - Math.pow( sin, 2 ) ) ) * (  sizeRotated.width * cos - sizeRotated.height * sin ) )
        ,   height : Math.round( ( 1 / ( Math.pow( cos, 2 ) - Math.pow( sin, 2 ) ) ) * ( -sizeRotated.width * sin + sizeRotated.height * cos ) )
        };
    };

    module.getMatrix = function( rotation, scale, position, sizeReal ) 
    {
        var sin = scale * rotation.sin
        ,   cos = scale * rotation.cos

        // Translate origin to center.
        //
        ,   matrixPre =
            [
                 [ 1, 0, scale * ( sizeReal.width / 2 ) ]
            ,    [ 0, 1, scale * ( sizeReal.height / 2 ) ]
            ,    [ 0, 0, 1 ]
            ]
        
        // Scale, Rotate, Translate to actual position.
        //
        ,   matrix =
            [
                [ cos, -sin, position.x ]
            ,   [ sin,  cos, position.y ]
            ,   [ 0, 0, 1 ]
            ]
        
        // Translate origin back to top left.
        //
         ,  matrixPost =
            [
                [ 1, 0, -( sizeReal.width  / 2 ) ]
            ,   [ 0, 1, -( sizeReal.height / 2 ) ]    
            ,   [ 0, 0, 1 ]
            ]
        ;

        return module.matrixMultiply( matrixPre, module.matrixMultiply( matrix, matrixPost ) );
    };

    module.matrixMultiply = function( matrix1, matrix2 ) 
    {
        var i  = matrix1.length
        , nj   = matrix2[0].length
        , j
        , cols = matrix1[0].length
        , c
        , elements = []
        , sum;
        
        while (i--) 
        { 
            j = nj;
            elements[i] = [];
            
            while (j--) 
            { 
                c = cols;
                sum = 0;
                
                while (c--)
                {
                    sum += matrix1[i][c] * matrix2[c][j];
                }

                elements[i][j] = sum;
            }
        }
        return elements;
    };

    module.testForVML = function() 
    {
        var div       = document.body.appendChild( document.createElement( "div" ) );
        div.innerHTML = "<v:shape adj='1' />";

        var shape            = div.firstChild;
        shape.style.behavior = "url(#default#VML)";
    
        var supportsVml = shape ? typeof shape.adj == "object": true;
        div.parentNode.removeChild( div );
        
        return supportsVml;
    };

    module.testForCanvas = function() 
    {
        return !!document.createElement("canvas").getContext;
    };

    module.testForSVG = function()
    {   
        var testForSVG           = !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect
        ,   testForForeignObject = "function" === typeof SVGForeignObjectElement
        ;

        return testForSVG && testForForeignObject;
    };
  
    return module;
});