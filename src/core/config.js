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
            }

        // Render engines
        //
        ,   engines :
            {
                order : [ "canvas", "svg", "vml" ]
            ,   types :
                {
                    svg :
                    {
                        name    : "svg"
                    ,   support : utilDetect.HAS_SVG
                    }

                ,   vml :
                    {
                        name    : "vml"
                    ,   support : utilDetect.HAS_VML
                    }

                ,   canvas :
                    {
                        name    : "canvas"
                    ,   support : utilDetect.HAS_CANVAS
                    }
                }
            ,   selectionColor : "#000000"
            ,   selectionDash  : 5
            }

        // Models
        //
        ,   models :
            {
                text :
                {
                    lineHeight : 1.25
                ,   fontSize   : 14
                ,   font       : "Arial"
                ,   color      : "#000000"
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
                    target : ".imageCreatorUIInfo"
                }

            ,   message :
                {
                    target : ".imageCreatorUIMessage"
                }

            ,   dimensions :
                {
                    target : ".imageCreatorUIDimensions"
                ,   scale  :
                    {
                        text  : { start : 14,  reduce : 1,   min : 10, max : 99,  unit : "px" }
                    ,   image : { start : 100, reduce : 300, min : 30, max : 300, unit : "%"  }
                    }
                }

            ,   library :
                {
                    target : ".imageCreatorUILibrary"
                }

            ,   layers :
                {
                    target : ".imageCreatorUILayers"
                }

            ,   filters :
                {
                    target : ".imageCreatorUIFilters"
                ,   types  :
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
                }

            ,   text :
                {
                    target      : ".imageCreatorUIText"
                ,   defaultText : "Lorem ipsum dolor sit amet.\nConsectetur adipiscing elit. Proin malesuada.\nLigula in blandit rutrum, libero ipsum luctus augue, diam sagittis dui.\nVivamus fermentum urna sit amet libero volutpat ac consectetur purus placerat."
                }

            ,   selection :
                {
                    target  : ".imageCreatorViewport"
                ,   offset  : 2
                ,   grips   : [ "N", "NE", "E", "SE", "S", "SW", "W", "NW" ]
                ,   bbColor : "#000000"
                }
            }
        }

    ,   options : {}
    };

    module.initialize = function()
    {
        module.options = $.extend( true, {}, module.defaults, window.imageCreatorSettings || {} );
    };

    module.setOptions = function( options )
    {
        module.options = $.extend( true, {}, module.options, options || {} );
    };

    return module;
});