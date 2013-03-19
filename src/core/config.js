/**
 * @description A element cropper plugin.
 *
 * @name config
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // App core modules.
    //
    "utils"
],
function( utils )
{
    var module =
    {
        options : 
        {
            viewportWidth  : 500
        ,   viewportHeight : 625
        
        ,   engines :  
            {
                svg : 
                {
                    name    : "svg"
                ,   support : utils.testForSVG
                }

            ,   vml : 
                {
                    name    : "vml"
                ,   support : utils.testForVML
                }

            ,   canvas :
                {
                    name    : "canvas"
                ,   support : utils.testForCanvas
                }    
            }

        ,   engineOrder : [ "svg", "canvas", "vml" ]

        ,   toolbar : 
            { 
                info : 
                {
                    title           : "Info"
                ,   target          : ".imageCreatorToolInfo"
                }

            ,   layers : 
                {
                    title            : "Layers"
                ,   constrainLayers  : true
                ,   autoSelectLayer  : false
                ,   showMenu         : true
                ,   buttonLayersSave : 
                    {
                        text : "Save image"
                    }
                ,   target           : ".imageCreatorToolLayers"
                }

            ,   image : 
                {
                    title          : "Image"
                ,   imageDownScale : 300
                ,   imageZoomScale : [ 30, 300 ]
                ,   target         : ".imageCreatorToolImage"
                ,   filters        : 
                    {
                        sepia : 
                        {
                            name : "Sepia"
                        ,   type : "color"    
                        ,   strength : 0.5
                        ,   matrix : 
                            [
                            0.393, 0.769, 0.189, 0, 0,
                            0.349, 0.686, 0.168, 0, 0,
                            0.272, 0.534, 0.131, 0, 0,
                            0,     0,     0,     1, 0
                            ]
                        }
                    ,   inversed : 
                        {
                            name   : "Inversed"
                        ,   type   : "color"
                        ,   strength : 1
                        ,   strengthLocked : true
                        ,   matrix : 
                            [
                            -1,  0,  0, 0, 1,
                             0, -1,  0, 0, 1,
                             0,  0, -1, 0, 1,
                             0,  0,  0, 1, 0
                            ]
                        }
                    }
                }

            ,   text : 
                {
                    title          : "Text"
                ,   textSizeScale  : [ 10, 99 ]
                ,   textLineHeight : 1.2
                ,   font           : "Arial" 
                ,   googleFonts    : [ ]
                ,   target         : ".imageCreatorToolText"                
                }
            }
        }

    ,   engine : {}
    };

    module.setOptions = function( options )
    {
        module.options = $.extend( true, {}, module.options, options || {} );
    };

    module.setEngine = function( engineName )
    {
        module.engine = engineName || "";
    };

    if( "object" === typeof imageCreatorSettings )
    {
        module.setOptions( imageCreatorSettings );
    }

    return module;
});