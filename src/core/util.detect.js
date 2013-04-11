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

    module.HAS_VML = function()
    {
        var div       = document.body.appendChild( document.createElement( "div" ) );
        div.innerHTML = "<v:shape adj='1' />";

        var shape            = div.firstChild;
        shape.style.behavior = "url(#default#VML)";

        var supportsVml = shape ? typeof shape.adj == "object": true;
        div.parentNode.removeChild( div );

        return supportsVml;
    }();

    module.HAS_SVG            = !!document.createElementNS && !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect

    module.HAS_FOREIGN_OBJECT = "function" === typeof SVGForeignObjectElement

    module.HAS_CANVAS         = !!document.createElement( "canvas" ).getContext;

    module.IS_PRE_IE9         = window.attachEvent && !window.addEventListener;

    module.HAS_POINTEREVENTS  = navigator.pointerEnabled || navigator.msPointerEnabled;

    module.HAS_TOUCHEVENTS    = ("ontouchstart" in window);

    module.NO_MOUSEEVENTS     = module.HAS_TOUCHEVENTS && navigator.userAgent.match(/mobile|tablet|ip(ad|hone|od)|android/i);

    return module;
});