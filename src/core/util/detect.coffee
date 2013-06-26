#
# @description
#
# @namespace imageCreator
# @name util.detect
# @version 1.0
# @author mbaijs
#
define [], () ->

    module = {}

    module.HAS_VML = ( () ->

        div           = document.body.appendChild document.createElement( "div" )
        div.innerHTML = "<v:shape adj='1' />"

        shape                = div.firstChild
        shape.style.behavior = "url(#default#VML)"

        supportsVml = if shape then typeof shape.adj is "object" else true;
        div.parentNode.removeChild div

        return supportsVml
    )()

    module.HAS_SVG = ( () ->

        !!document.createElementNS and !!document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect
    )()

    module.HAS_FOREIGN_OBJECT = ( () ->

        "function" is typeof SVGForeignObjectElement
    )()

    module.HAS_CANVAS = ( () ->

        !!document.createElement( "canvas" ).getContext
    )()

    module.IS_PRE_IE9 = ( () ->

        window.attachEvent and !window.addEventListener;
    )()

    module.HAS_POINTEREVENTS = ( () ->

        navigator.pointerEnabled or navigator.msPointerEnabled;
    )()

    module.HAS_TOUCHEVENTS = ( () ->

        ( "ontouchstart" of window )
    )()

    module.NO_MOUSEEVENTS = ( () ->

        module.HAS_TOUCHEVENTS and navigator.userAgent.match /mobile|tablet|ip(ad|hone|od)|android/i
    )()

    return module