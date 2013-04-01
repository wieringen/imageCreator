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

    module.hasVML = function() 
    {
        var div       = document.body.appendChild( document.createElement( "div" ) );
        div.innerHTML = "<v:shape adj='1' />";

        var shape            = div.firstChild;
        shape.style.behavior = "url(#default#VML)";
    
        var supportsVml = shape ? typeof shape.adj == "object": true;
        div.parentNode.removeChild( div );
        
        return supportsVml;
    };

    module.hasCanvas = function() 
    {
        return !!document.createElement("canvas").getContext;
    };

    module.hasSVG = function()
    {   
        var testForSVG           = !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect
        ,   testForForeignObject = "function" === typeof SVGForeignObjectElement
        ;

        return testForSVG;
    };
  
    return module;
});