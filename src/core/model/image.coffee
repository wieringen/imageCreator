# @module image
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
        options : config.options.models.image

    # @class Image
    # @extends Layer
    # @constructor
    #
    class Image extends modelLayer

        type  : "image"
        src   : ""
        plane : "baseline"

        # These properties will hold img or canvas objects.
        #
        image            : null
        imageManipulated : null

        sizeReal :
            width  : 0
            height : 0

        filter :
            name     : "None"
            matrix   : false
            strength : 1

        mask :
            name   : "None"
            x      : 0
            y      : 0
            width  : 0
            height : 0
            src    : ""

        canHaveMask   : true
        canHaveFilter : true
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

            return jQuery.extend super(propertiesToInclude), {
                src       : @src
                type      : @type
                plane     : @plane

                sizeReal  : @sizeReal
                filter    : @filter
                mask      : @mask
            }

        setScale : (scale = @scale) ->

            @scale = Math.max 0.1, Math.min(1, scale)

            sizeNew =
                width  : Math.round @scale * @sizeReal.width
                height : Math.round @scale * @sizeReal.height

            newPosition =
                x : (@sizeCurrent.width  - sizeNew.width ) / 2
                y : (@sizeCurrent.height - sizeNew.height) / 2

            @sizeCurrent = sizeNew
            @sizeRotated = utilMath.getBoundingBox @sizeCurrent, @rotation

            @setPosition newPosition

            return true

        setFilter : (filter) ->

            @filter = filter or {
                name     : "None"
                matrix   : false
                strength : 1
            }

        setMask : (mask = {}) ->

            @mask.name  = mask.name
            @mask.src   = mask.src
            @mask.ratio = mask.ratio

            @setMaskPosition 0, 0

            @setMaskSize @sizeReal.width, @sizeReal.height

        setMaskPosition : (x, y) ->

            @mask.x = x
            @mask.y = y

        setMaskSize : (width, height) ->

            @mask.width  = width
            @mask.height = height

        setFilterStrength : (strength) ->

            @filter.strength = strength / 100

        setImageManipulated : (image) ->

            @imageManipulated = image


    # @method fromObject
    # @static
    #
    Image.fromObject = (object, callback) ->

        deferred = jQuery.Deferred()

        onload = (img) ->

            model = new Image img, object

            deferred.resolve model

            if callback then callback model

        onerror = ->

            deferred.resolve()

        utilMisc.getImageFromURL object.src, onload, onerror

        return deferred.promise()

    return Image