;( function( $ )
{
   /**
    * Retrieves an application context and creates all the intermediate steps
    *
    * @param path    (string) The 'path' to the required attribute. Example 'company.apps.data.something'
    * @param context (object) The root object to retrieve the value from. Defaults to the window object
    *
    * @return Requested context object
    */
    $.getAndCreateContext = function( path, context )
    {
        if ( !context ) { context = window; }

        var aPath = path.split( "." );
        var value = context;
        var key   = aPath.shift();

        while( key )
        {
            if ( !value[ key ] )
            {
                value[ key ] = {};
            }
            value = value[ key ];

            key = aPath.shift();
        }

        return value;
    }
} )( jQuery );