/**
*
* @module setup
* Set up the paths and start the app
*/

require(
    {
        paths :
        {
            // App paths
            //
            "plugins"   : "../lib"
        ,   "templates" : "../templates"

            // Require plugins
            //
        ,   "text"          : "../lib/require/text"
        ,   "cs"            : "../lib/require/cs"
        ,   "coffee-script" : "../lib/require/coffee-script"
        }
    }
,   [
        "cs!setup"
    ]
);