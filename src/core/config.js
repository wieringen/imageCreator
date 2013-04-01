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
    "util.detect"
],
function( utilDetect )
{
    var module =
    {
        defaults : 
        {

            viewport : 
            {
                width  : 500
            ,   height : 625
            ,   constrainLayers : true
            }

        // Render engines
        //
        ,   engines :  
            {
                order : [ "svg", "canvas", "vml" ]
            ,   types : 
                {
                    svg : 
                    {
                        name    : "svg"
                    ,   support : utilDetect.hasSVG
                    }

                ,   vml : 
                    {
                        name    : "vml"
                    ,   support : utilDetect.hasVML
                    }

                ,   canvas :
                    {
                        name    : "canvas"
                    ,   support : utilDetect.hasCanvas
                    }
                }    
            }

        // Filters
        //
        ,   filters: 
            {
                color : 
                {
                    sepia : 
                    {
                        name : "Sepia"
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
                    ,   strength : 1
                    ,   locked : true
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

        // layers settings
        //
        ,   layers :
            {
                text : 
                {
                    lineHeight : 1.25
                ,   fontSize   : 14
                ,   font       : "Arial" 
                }
            ,   image :
                {

                }
            }

        // User interface
        //
        ,   ui : 
            { 
                info : 
                {
                    title  : "Info"
                ,   target : ".imageCreatorToolInfo"
                }

            ,   layers : 
                {
                    title  : "Layers"
                ,   target : ".imageCreatorToolLayers"
                }

            ,   image : 
                {
                    title     : "Image"
                ,   target    : ".imageCreatorToolImage"
                ,   downScale : 300
                ,   zoomScale : [ 30, 300 ]
                }

            ,   text : 
                {
                    title     : "Text"
                ,   target    : ".imageCreatorToolText"
                ,   sizeScale : [ 10, 99 ]
                }

            ,   selection : 
                {
                    offset : 2
                ,   grips  : [ "N", "NE", "E", "SE", "S", "SW", "W", "NW" ]
                }
            }
        }

    ,   options : {}
    ,   engine  : {}
    };

    module.initialize = function()
    {
        module.options = $.extend( true, {}, module.defaults, window.imageCreatorSettings || {} );
    };

    module.setOptions = function( options )
    {
        module.options = $.extend( true, {}, module.options, options || {} );
    };

    module.setEngine = function( engineName )
    {
        module.engine = engineName || "";
    };

    return module;
});