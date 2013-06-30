# @module balloon
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

        options : config.options.models.image

    # @class Image
    # @extends Layer
    # @constructor
    #
    class Balloon extends modelLayer

        type : "balloon"
        src  : ""

        # These properties will hold img or canvas objects.
        #
        image : null

        sizeReal :
            width  : 0
            height : 0

        text       : ""
        textLines  : []
        color      : module.options.color
        fontSize   : module.options.fontSize
        lineHeight : module.options.lineHeight
        font       : module.options.font
        textAlign  : module.options.textAlign
        weight     : "normal"
        style      : "normal"

        canHaveMask   : false
        canHaveFilter : false
        canHaveText   : false
        canHaveImage  : true

        scaleByFontSize : false

        constructor : (element, options = {}) ->

            super options

            @image = element
            @name  = @src.substring @src.lastIndexOf("/") + 1

            @sizeReal =
                width  : @image.width
                height : @image.height

            @id = options.id or "image" + new Date().getTime().toString()

            if not options.sizeCurrent

                @sizeCurrent =
                    width  : @sizeReal.width
                    height : @sizeReal.height

            @_initConfig options

            @setScale()

        _initConfig : (options = {}) ->

            @setOptions options

        toObject : (propertiesToInclude) ->

            return jQuery.extend super( propertiesToInclude ), {
                src       : @src
                type      : @type
                imageType : @imageType
                sizeReal  : @sizeReal
            }

        setScale : (scale = @scale) ->

            @scale = Math.max 0.1, Math.min( 1, scale )

            sizeNew =
                width  : Math.round @scale * @sizeReal.width
                height : Math.round @scale * @sizeReal.height

            newPosition =
                x : ( @sizeCurrent.width  - sizeNew.width  ) / 2
                y : ( @sizeCurrent.height - sizeNew.height ) / 2

            @sizeCurrent = sizeNew
            @sizeRotated = utilMath.getBoundingBox @sizeCurrent, @rotation

            @setPosition newPosition


    # @method fromObject
    # @static
    #
    Balloon.fromObject = ( object, callback ) ->

        deferred = jQuery.Deferred()

        onload = ( img ) ->

            model = new Balloon img, object

            deferred.resolve model

            if callback then callback model

        onerror = () ->

            deferred.resolve()

        utilMisc.getImageFromURL object.src, onload, onerror

        return deferred.promise()

    return Balloon