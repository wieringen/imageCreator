/*global module:false*/
module.exports = function(grunt)
{
    grunt.initConfig(
    {
        pkg  : grunt.file.readJSON( "package.json" )

    ,   meta :
        {
            banner :
            '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n ' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n *\\n " : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %> <<%= pkg.author.email %>>;\n' +
            ' * Licensed under the <%= _.pluck(pkg.licenses, "type").join(", ") %> license */\n\n'
        }

    //  Remove old build.
    //
    ,   clean :
        {
            dist :
            {
                src : [ "dist" ]
            }
        }

    //  Create Documentation.
    //
    ,   yuidoc :
        {
            compile:
            {
                name :        "<%= pkg.name %>"
            ,   description : "<%= pkg.description %>"
            ,   version :     "<%= pkg.version %>"
            ,   url :         "<%= pkg.homepage %>"
            ,   options:
                {
                    paths  : "src/core/"
                ,   outdir : "docs/"
                }
            }
        }

    //  Copy the images and the index to the dist location.
    //
    ,   copy :
        {
            dist :
            {
                files :
                [
                    { expand: true, cwd: "src", src: "images/**/*", dest: "dist/src" }
                ,   { expand: true, cwd: "src", src: "temp/*",      dest: "dist/src" }
                ,   { expand: true, cwd: "src", src: "index.html",  dest: "dist/src" }
                ]
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
                        "ui.filters"
                    ,   "ui.text"
                    ,   "ui.info"
                    ,   "ui.layers"
                    ,   "ui.library"
                    ,   "ui.dimensions"
                    ,   "ui.selection"
                    ,   "engine.svg"
                    ,   "engine.canvas"
                    ,   "engine.vml"
                    ]
                ,   paths :
                    {
                        "plugins"     : "../lib"
                    ,   "templates"   : "../templates"
                    ,   "text"        : "../lib/require/text"
                    }
                ,   replaceRequireScript :
                    [
                        {
                            files      : [ "dist/src/index.html" ]
                        ,   module     : "main"
                        ,   modulePath : "jquery.imageCreator"
                        }
                    ]

                ,   name    : "main"
                ,   baseUrl : "src/core"
                ,   out     : "dist/src/jquery.<%= pkg.name %>.js"
                ,   wrap    : true
                ,   almond  : true
                ,   optimize :  "uglify2"
                ,   preserveLicenseComments : false
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
                    "src/css/base.css"
                ,   "src/css/buttons.css"
                ,   "src/css/ui.base.css"
                ,   "src/css/ui.filters.css"
                ,   "src/css/ui.text.css"
                ,   "src/css/ui.info.css"
                ,   "src/css/ui.layers.css"
                ,   "src/css/ui.library.css"
                ,   "src/css/ui.dimensions.css"
                ,   "src/css/ui.selection.css"
                ]

            ,   dest : "dist/src/css/<%= pkg.name %>.css"
            }
        }


    //  Minify the css.
    //
    ,   cssmin :
        {
            options :
            {
                banner : "<%= meta.banner %>"
            }
        ,   dist :
            {
                src  : "dist/src/css/<%= pkg.name %>.css"
            ,   dest : "dist/src/css/<%= pkg.name %>.css"
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
                    "dist/src/<%= pkg.name %>.css" : "dist/src/<%= pkg.name %>.css"
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

    // Make a zipfile.
    //
    ,   compress :
        {
            dist :
            {
                options :
                {
                    archive: "dist/<%= pkg.name %>-<%= pkg.version %>.zip"
                }
            ,   expand  : true
            ,   cwd     : "dist/src"
            ,   src     : ["**/*"]
            ,   dest    : "."
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
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-contrib-cssmin" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-concat" );
    grunt.loadNpmTasks( "grunt-contrib-yuidoc" );
    grunt.loadNpmTasks( "grunt-string-replace" );
    grunt.loadNpmTasks( "grunt-contrib-compress" );

    //  Define the default build task.
    //
    grunt.registerTask( "default", [ "clean:dist", "yuidoc", "copy:dist", "concat:dist", "cssmin:dist", "requirejs:dist", "compress:dist" ] );

    //  Check yourself before you wreck yourself.
    //
    grunt.registerTask( "sherlock", [ "watch:javascript" ] );
};
