/**
 * @description <p>A collection of reusable utility functions.</p>
 *
 * @namespace imageCreator
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
define(
[],
function()
{
    var module = {};

    module.populateWithProperties = function(source, destination, properties)
    {
        if(properties && Object.prototype.toString.call(properties) === '[object Array]')
        {
            for (var i = 0, len = properties.length; i < len; i++)
            {
                destination[properties[i]] = source[properties[i]];
            }
        }
    };

    module.measureText = function( object )
    {
        var measureDiv = document.createElement( "measureDiv" );
        measureDiv.className = "imageCreatorMeasureText";

        document.body.appendChild(measureDiv);

        measureDiv.style.fontSize   = object.fontSize + "px";
        measureDiv.style.fontFamily = object.font;
        measureDiv.style.fontWeight = object.weight ? "bold" : "normal";

        if( window.attachEvent && !window.addEventListener )
        {
            measureDiv.innerText = object.text;
        }
        else
        {
            $( measureDiv ).text( object.text );
        }

        var textWidth = measureDiv.clientWidth + 10;

        document.body.removeChild(measureDiv);
        measureDiv = null;

        return textWidth;
    };

    module.whenAll = function(arr)
    {
        return $.when.apply($, arr).pipe(function()
        {
            return $.grep( Array.prototype.slice.call(arguments), function(value)
            {
                return(value);
            });
        });
    };

    module.loadModules = function( modules, prefix, callback )
    {
        var urls  = []
        ,   names = []
        ;

        $.each( modules, function( moduleName )
        {
            urls.push( prefix + "." + moduleName );
            names.push( moduleName );
        });

        require( urls, function()
        {
            var resultSet = [];

            $.each( arguments, function( index, module )
            {
                resultSet[ names[ index ] ] = module;
            });

            callback( resultSet );
        });
    };

    return module;
});