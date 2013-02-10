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