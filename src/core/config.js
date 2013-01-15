/**
 * @description A element cropper plugin.
 *
 * @name settings
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
            viewportWidth  : 520
        ,   viewportHeight : 360
        
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

        ,   engineOrder : [ "svg", "vml", "canvas" ]

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
                ,   imageDownScale : 3
                ,   imageZoomScale : [ 30, 300 ]
                ,   target         : ".imageCreatorToolImage" 
                }

            ,   text : 
                {
                    title          : "Text"
                ,   textWidth      : 180
                ,   textHeight     : 30
                ,   textSizeScale  : [ 10, 99 ]
                ,   font           : "Arial" 
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