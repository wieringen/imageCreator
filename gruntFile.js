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


    ,   karma :
        {
            continuous :
            {
                configFile: "karma.conf.js"
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

    //  Preprocess the sass files.
    //
    ,   compass :
        {
            dist :
            {
                options :
                {
                     config : "config.rb"
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
                    { expand: true, cwd: "src", src: "images/**/*",    dest: "dist/src" }
                ,   { expand: true, cwd: "src", src: "temp/*",         dest: "dist/src" }
                ,   { src: "src/css/style.css", dest: "dist/src/css/style.css" }
                ,   { expand: true, cwd: "src", src: "index.html",     dest: "dist/src" }
                ]
            }
        }

    //  Validate javascript files with jsHint.
    //
    ,   jshint :
        {
            options :
            {
                jshintrc : ".jshintrc"
            }
        ,   all :
            [
               // "src/lib/*.js"
                "src/core/**/*.js"
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
                        "ui.effects"
                    ,   "ui.text"
                    ,   "ui.info"
                    ,   "ui.layers"
                    ,   "ui.library"
                    ,   "ui.dimensions"
                    ,   "ui.selection"
                    ,   "ui.message"
                    ,   "engine.svg"
                    ,   "engine.canvas"
                    ,   "engine.vml"
                    ]
                ,   mainConfigFile : "src/core/main.js"
                ,   stubModules :
                    [
                        "cs"
                    ,   "text"
                    ,   "coffee-script"
                    ]
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
                ,   optimize: "none"
                }
            }
        }

    // Minify the javascript.
    //
    ,   uglify :
        {
            dist :
            {
                options :
                {
                    banner   : "<%= meta.banner %>"
                ,   beautify : false
                }
            ,   files :
                {
                    "dist/src/jquery.<%= pkg.name %>.min.js" :
                    [
                        "dist/src/jquery.<%= pkg.name %>.js"
                    ]
                }
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
                    "dist/src/css/style.css" : "dist/src/css/style.css"
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

        //  Watch for changes in sass files and run compass if it finds any.
        //
        ,   compass :
            {
                files :
                [
                    "src/sass/**/*.scss"
                ]
            ,   tasks :
                [
                    "compass:dist"
                ]
            ,   options :
                {
                    interrupt: false
                }
            }
        }
    });


    //  Load all the task modules we need.
    //
    grunt.loadNpmTasks( "grunt-karma" );
    grunt.loadNpmTasks( "grunt-requirejs" );
    grunt.loadNpmTasks( "grunt-contrib-copy" );
    grunt.loadNpmTasks( "grunt-contrib-compass" );
    grunt.loadNpmTasks( "grunt-contrib-clean" );
    grunt.loadNpmTasks( "grunt-contrib-watch" );
    grunt.loadNpmTasks( "grunt-contrib-jshint" );
    grunt.loadNpmTasks( "grunt-contrib-uglify" );
    grunt.loadNpmTasks( "grunt-contrib-yuidoc" );
    grunt.loadNpmTasks( "grunt-string-replace" );
    grunt.loadNpmTasks( "grunt-contrib-compress" );

    //  Define the default build task.
    //
    grunt.registerTask(
        "default"
    ,   [
            "clean:dist"
        //,   "karma:continuous"
        ,   "yuidoc"
        ,   "compass:dist"
        ,   "copy:dist"
        ,   "requirejs:dist"
        ,   "uglify:dist"
        ,   "compress:dist"
        ]
    );
};
