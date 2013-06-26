# @module text
#
define [

    # App core modules.
    #
    "config"
,   "cs!util/math"
,   "cs!util/misc"
,   "cs!model/layer"

], ( config, utilMath, utilMisc, modelLayer ) ->

    module =

        options : config.options.models.text

    # @class Text
    # @extends Layer
    # @constructor
    #
    class Text extends modelLayer

        type       : "text"
        text       : ""
        textLines  : []
        color      : module.options.color
        fontSize   : module.options.fontSize
        lineHeight : module.options.lineHeight
        font       : module.options.font
        textAlign  : module.options.textAlign
        weight     : false
        style      : false

        canHaveMask : false
        canHaveText : true

        constructor : ( options = {} ) ->

            super options

            @id        = options.id || "text" + new Date().getTime().toString()
            @layerName = @text

            @_initConfig options

            @setLines()
            @setFontSize()

        _initConfig : ( options = {} ) ->

            @setOptions(options)

        toObject : ( propertiesToInclude ) ->

            return jQuery.extend super( propertiesToInclude ), {
                type            : @type
                text            : @text
                textLines       : @textLines
                color           : @color
                fontSize        : @fontSize
                lineHeight      : @lineHeight
                font            : @font
                weight          : @weight
                style           : @style
            }

        setText : ( text = "" ) ->

            @text = text

            @setLines()
            @setFontSize()

        setLines : () ->

            @textLines = @text.replace(/\r\n/g, "\n").split("\n")

        setScale : ( scale ) ->

            @setFontSize scale

        setFontSize : ( fontSize = @fontSize ) ->

            @fontSize = Math.max 10, Math.min( 99, fontSize )

            sizeNew =
                width  : utilMisc.measureText @
                height : @textLines.length * Math.floor @fontSize * @lineHeight

            newPosition =
                x : ( @sizeCurrent.width - sizeNew.width ) / 2
                y : ( @sizeCurrent.height - sizeNew.height ) / 2

            @sizeCurrent = sizeNew
            @sizeRotated = utilMath.getBoundingBox @sizeCurrent, @rotation

            @setPosition newPosition

        setFont : ( font ) ->

            @font = font

            @setFontSize()

        setColor : ( hexColor ) ->

            @color = hexColor

        setWeight : ( weight ) ->

            @weight = weight

            @setFontSize()

        setStyle : ( style ) ->

            @style = style

        setTextAlign : ( textAlign ) ->

            @textAlign = textAlign


    # @method fromObject
    # @static
    #
    Text.fromObject = ( object, callback ) ->

        deferred = jQuery.Deferred()
        model    = new Text object

        deferred.resolve model

        if callback then callback model

        return deferred.promise()

    return Text
