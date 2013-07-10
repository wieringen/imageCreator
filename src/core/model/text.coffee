# @module text
# @author mbaijs
#
define [

    # App core modules.
    #
    "cs!config"
,   "cs!util/math"
,   "cs!util/misc"
,   "cs!model/layer"

], (config, utilMath, utilMisc, modelLayer) ->

    module =
        options : config.options.models.text

    # @class Text
    # @extends Layer
    # @constructor
    #
    class Text extends modelLayer

        type       : "text"
        plane      : "baseline"

        text       : ""
        textLines  : []
        textRegion : false
        color      : module.options.color
        fontSize   : module.options.fontSize
        lineHeight : module.options.lineHeight
        font       : module.options.font
        textAlign  : module.options.textAlign
        weight     : "normal"
        style      : "normal"

        canHaveMask   : false
        canHaveFilter : false
        canHaveText   : true
        canHaveImage  : false

        scaleByFontSize : true

        constructor : (options = {}) ->

            super options

            @id        = options.id or "text" + new Date().getTime().toString()
            @layerName = @text

            @_initConfig options

            @setLines()
            @setFontSize()

        _initConfig : (options = {}) ->

            @setOptions(options)

        toObject : (propertiesToInclude) ->

            return jQuery.extend super(propertiesToInclude), {
                type       : @type
                text       : @text
                plane      : @plane
                textLines  : @textLines
                textAlign  : @textAlign
                color      : @color
                fontSize   : @fontSize
                lineHeight : @lineHeight
                font       : @font
                weight     : @weight
                style      : @style
            }

        setText : (text = "") ->

            @text = text

            @setLines()
            @setFontSize()

        setLines : ->

            @textLines = @text.replace(/\r\n/g, "\n").split("\n")

        setFontSize : (fontSize = @fontSize) ->

            @fontSize = Math.max 10, Math.min(99, fontSize)

            sizeNew =
                width  : utilMisc.measureText(@).width
                height : (@textLines.length * Math.floor(@fontSize)) * @lineHeight

            newPosition =
                x : (@sizeCurrent.width - sizeNew.width) / 2
                y : (@sizeCurrent.height - sizeNew.height) / 2

            @sizeCurrent = sizeNew
            @sizeRotated = utilMath.getBoundingBox @sizeCurrent, @rotation

            @setPosition newPosition

        setFont : (font) ->

            @font = font

            @setFontSize()

        setColor : (hexColor) ->

            @color = hexColor

        setWeight : (weight) ->

            @weight = weight

            @setFontSize()

        setStyle : (style) ->

            @style = style

        setTextAlign : (textAlign) ->

            @textAlign = textAlign


    # @method fromObject
    # @static
    #
    Text.fromObject = (object, callback) ->

        deferred = jQuery.Deferred()
        model = new Text object

        deferred.resolve model

        if callback then callback model

        return deferred.promise()

    return Text
