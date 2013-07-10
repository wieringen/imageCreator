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
/*
$selection.delegate ".gripScale", "mousedown", selectionScale

var fullCircle = 2 * Math.PI
,   $selection = $(".selection")
,   grips      = [ "n", "ne", "e", "se", "s", "sw", "w", "nw" ]
,   direction  =
    {
        e: function(dx, dy) {
            return { width: layerWidth + dx };
        },
        w: function(dx, dy)
        {
            return { width: layerWidth - dx };
        },
        n: function(dx, dy) {
            return { height: layerHeight - dy };
        },
        s: function(dx, dy) {
            return { height: layerHeight + dy };
        },
        se: function(dx, dy) {
            return $.extend(direction.s(dx, dy), direction.e(dx, dy));
        },
        sw: function(dx, dy) {
            return $.extend(direction.s(dx, dy), direction.w(dx, dy));
        },
        ne: function(dx, dy) {
            return $.extend(direction.n(dx, dy), direction.e(dx, dy));
        },
        nw: function(dx, dy) {
            return $.extend(direction.n(dx, dy), direction.w(dx, dy));
        }
    }
;

function getBoundingBox(sizeUnrotated, radians)
{
    var sin = Math.abs(Math.sin(radians))
    ,   cos = Math.abs(Math.cos(radians))
    ;

    return {
        width  : sizeUnrotated.height * sin + sizeUnrotated.width * cos
    ,   height : sizeUnrotated.height * cos + sizeUnrotated.width * sin
    }
}

function sanitizeRadians(radians)
{
    var radiansSanitized;

    if( radians < 0 )
    {
        radiansSanitized = fullCircle + radians
    }
    else
    {
        if( radians > fullCircle )
        {
           radiansSanitized = radians - fullCircle
        }
        else
        {
            radiansSanitized = radians
        }
    }

    return radiansSanitized;
}

function selectionScale(event)
{
    var layerHeight  = $selection.height()
    ,   layerWidth   = $selection.width()
    ,   bBox         = getBoundingBox()
    ,   layerScale   = layerCurrent.scale
    ,   aspectRatio  = layerWidth / layerHeight
    ,   mouseX       = event.pageX
    ,   mouseY       = event.pageY
    ,   gripPosition =
        {
            x: event.pageX - $selection.offset().left - (layerCurrent.sizeRotated.width / 2)
        ,   y: event.pageY - $selection.offset().top - (layerCurrent.sizeRotated.height / 2)
        }
    ,   gripRadians = sanitizeRadians(Math.atan2(gripPosition.x, -gripPosition.y))
    ,   gripIndex   = Math.round(gripRadians / (fullCircle / grips.length))
    ;
    gripIndex = (gripIndex === grips.length ? 0 : gripIndex);
    gripName  = grips[gripIndex];

    $(document).on("mousemove.selection", function(event)
    {
        var dx     = ((event.pageX - mouseX) || 0) * 2
        ,   dy     = ((event.pageY - mouseY) || 0) * 2
        ,   dimNew = direction[gripName](dx, dy)
        ;

        if(LayerDimNew.width)
        {
            LayerDimNew.height = LayerDimNew.width / aspectRatio;
        }
        else if(LayerDimNew.height)
        {
            LayerDimNew.width = LayerDimNew.height * aspectRatio;
        }

        var newScale = LayerDimNew.width * 1 / layerCurrent.sizeReal.width;
    });

    $(document).on("mouseup.selection", function(event)
    {
        $(document).unbind(".selection");
        return false;
    });

    return false;
};*/
