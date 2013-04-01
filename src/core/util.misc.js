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
    }

    module.measureText = function( object ) 
    {
        var measureDiv = document.createElement( "measureDiv" );

        document.body.appendChild(measureDiv);

        measureDiv.style.fontSize   = object.fontSize + "px";
        measureDiv.style.fontFamily = object.font;
        measureDiv.style.fontWeight = object.weight ? "bold" : "normal";
        measureDiv.style.position   = "absolute";
        measureDiv.style.left       = "0px";
        measureDiv.style.top        = "0px";
        measureDiv.style.top        = "0px";
        measureDiv.style.visibility = "hidden";
        measureDiv.style.whiteSpace = "pre";
        
        measureDiv.innerHTML = object.text;

        var textWidth = measureDiv.clientWidth + 10;

        document.body.removeChild(measureDiv);
        measureDiv = null;

        return textWidth;
    };
  
    return module;
});