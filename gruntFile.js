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
            dist : 
            {
                src : [ "dist" ]
            }
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

    //  Validate javascript files with jsHint.
    //
    ,   jshint : 
        {
            options : 
            {
                "laxcomma" : true
            ,   "laxbreak" : false
            }
        ,   all : 
            [ 
                "src/lib/*.js" 
            ,   "src/core/**/*.js"
            ]
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
                        "lazyRequire" : "../lib/require/lazyRequire"
                    ,   "plugins"     : "../lib"
                    ,   "templates"   : "../templates"
                    ,   "text"        : "../lib/require/text"
                    }
                ,   replaceRequireScript : 
                    [
                        {
                            files      : [ "dist/index.html" ]
                        ,   module     : "main"
                        ,   modulePath : "jquery.imageCreator"
                        }
                    ]

                ,   name    : "main"
                ,   baseUrl : "src/core"
                ,   out     : "dist/jquery.imageCreator.js"
                ,   wrap    : true
                ,   almond  : true
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
                ,   "src/css/toolbar-base.css"
                ,   "src/css/toolbar-image.css"
                ,   "src/css/toolbar-text.css"
                ,   "src/css/toolbar-info.css"
                ,   "src/css/toolbar-layers.css"
                ]

            ,   dest : "dist/css/imageCreator.css"
            }
        }


    //  Minify the css.
    //
    ,   cssmin : 
        {
            dist : 
            {
                src  : "dist/css/imageCreator.css"
            ,   dest : "dist/css/imageCreator.css"
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
                }

            ,   options : 
                {
                    replacements :
                    [
                        {
                            pattern     : /..\/images\//g
                        ,   replacement : "images/"
                        }
                    ]
                }
            }
        }

    //  Watch for changes in js core and lib files and runs jshint if it finds any.
    //
    ,   watch : 
        {
            javascript : 
            {
                files : 
                [ 
                    "src/lib/*.js" 
                ,   "src/core/**/*.js"
                ]
            ,   tasks : 
                [
                    "jshint"
                ]
            ,   options : 
                {
                    interrupt: true
                }
            }
        }
    });


    //  Load all the task modules we need.
    //
    grunt.loadNpmTasks( "grunt-requirejs" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    grunt.loadNpmTasks( "grunt-contrib-concat" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );  
    grunt.loadNpmTasks( "grunt-css" );
    //grunt.loadNpmTasks( "grunt-string-replace" ); Damn it no grunt 0.4 support...

    //  Define the default build task.
    //
    grunt.registerTask( "default", [ "clean:dist", "copy:dist", "jshint", "concat:dist", "cssmin:dist", "requirejs:dist" ] );

    //  Check yourself before you wreck yourself.
    //
    grunt.registerTask( "sherlock", [ "watch:javascript" ] );
};
