/*global module:false*/
module.exports = function(grunt) 
{
    grunt.initConfig(
    {
        pkg  : "<json:package.json>"
        
    //  Remove old build.
    //
    ,   clean : 
        {
            folder: "dist"
        }

    //  Copy the images and the index to the dist location.
    //
    ,   copy : 
        {
            dist : 
            {
                files : 
                {
                    "dist/" : 
                    [ 
                        "src/images/*"
                    ,   "src/temp/*"
                    ,   "src/index.html"
                    ]
                }
            }
        }

    //  Optimize require modules and insert almond.
    //
    ,   requirejs : 
        {
            dist : 
            {
                options : 
                {
                    include : 
                    [
                        "toolbar/image"
                    ,   "toolbar/text"
                    ,   "toolbar/layers"
                    ,   "toolbar/info"
                    ,   "engine/svg"
                    ,   "engine/canvas"
                    ,   "engine/vml"
                    ]
                ,   paths : 
                    {
                        "lazyRequire"          : "../lib/require/lazyRequire"
                    ,   "plugins"              : "../lib"
                    ,   "templates"            : "../templates"
                    ,   "text"                 : "../lib/require/text"
                    }

                ,   name    : "main"
                ,   baseUrl : "src/core"
                ,   out     : "dist/jquery.imageCreator.js"
                ,   wrap    : true
                ,   almond  : true

                ,   replaceRequireScript : 
                    [{
                        files      : [ "dist/index.html" ]
                    ,   module     : "main"
                    ,   modulePath : "jquery.imageCreator"
                    }]
                }
            }
        }

    //  Concat the css together.
    //
    ,   concat : 
        {
            dist : 
            {
                src : 
                [
                    "src/css/core-base.css"
                ,   "src/css/core-buttons.css"
                ,   "src/css/toolbar-image.css"
                ,   "src/css/toolbar-text.css"
                ,   "src/css/toolbar-info.css"
                ,   "src/css/toolbar-layers.css"
                ]

            ,   dest : "dist/imageCreator.css"
            }
        }


    //  Minify the css.
    //
    ,   cssmin : 
        {
            css : 
            {
                src  : "dist/imageCreator.css"
            ,   dest : "dist/imageCreator.css"
            }
        }


    //  Replace image file paths in css and correct css path in the index.
    //
    ,   "string-replace" : 
        {
            dist : 
            {
                files : 
                {
                    "dist/imageCreator.css" : "dist/imageCreator.css"
                ,   "dist/index.html"       : "dist/index.html"
                }

            ,   options : 
                {
                    replacements :
                    [
                        {
                            pattern     : /..\/images\//g
                        ,   replacement : "images/"
                        }
                    ,   {
                            pattern     : "css/style.css"
                        ,   replacement : "imageCreator.css"
                        }                        
                    ]
                }
            }
        }
    });


    //  Load all the task modules we need.
    //
    grunt.loadNpmTasks( "grunt-requirejs" );
    grunt.loadNpmTasks( "grunt-css" );
    grunt.loadNpmTasks( "grunt-clean" );
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    grunt.loadNpmTasks( "grunt-string-replace" );

    //  Define the build task.
    //
    grunt.registerTask( "default", "copy concat cssmin requirejs string-replace" );
};
