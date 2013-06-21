# @module Image
#
define [

    # App core modules.
    #
    "config"
,   "cs!util.math"
,   "cs!model.layer"

], ( config, utilMath, modelLayer ) ->

    module =

        options : config.options.models.image

    # @class Image
    # @extends Layer
    # @constructor
    #
    class Image extends modelLayer

        type     : "image"
        sizeReal :
            width  : 0
            height : 0

        filter :
            name     : "None"
            matrix   : false
            strength : 1

        mask :
            name     : "None"
            position :
                x : 0
                y : 0

            size :
                width : 0
                height : 0

        imageManipulated : null

        canHaveMask : true
        canHaveText : false

        constructor : ( element, options ) ->

            options || ( options = { } )

            super options

            @image = element
            @name  = @src.substring( @src.lastIndexOf("/") + 1 )

            @sizeReal = {
                width  : @image.width
                height : @image.height
            }

            @id = options.id || "image" + new Date().getTime().toString()

            if ! options.sizeCurrent

                @sizeCurrent = {
                    width  : @sizeReal.width
                    height : @sizeReal.height
                }

            @_initConfig options

            @setScale()

        _initConfig : (options) ->

            options || (options = { })

            @setOptions options

        toObject : ( propertiesToInclude ) ->

            return jQuery.extend( super( propertiesToInclude ), {
                src       : @src
                type      : @type
                imageType : @imageType
                sizeReal  : @sizeReal
                filter    : @filter
                mask      : @mask
            })

        setScale : ( scale ) ->

            @scale = Math.max( 0.1, Math.min( 1, scale || @scale ) )

            sizeNew = {
                width  : Math.round( @scale * @sizeReal.width )
                height : Math.round( @scale * @sizeReal.height )
            }

            newPosition = {
                x : ( @sizeCurrent.width  - sizeNew.width  ) / 2
                y : ( @sizeCurrent.height - sizeNew.height ) / 2
            }

            @sizeCurrent = sizeNew
            @sizeRotated = utilMath.getBoundingBox( @sizeCurrent, @rotation )

            @setPosition newPosition

        setFilter : ( filter ) ->

            @filter = filter || {
                name     : "None"
            ,   matrix   : false
            ,   strength : 1
            }

        setMask : ( maskName ) ->

            @mask.name = maskName || "None"

        setMaskPosition : ( position ) ->

            @mask.position = position

        setFilterStrength : ( strength ) ->

            @filter.strength = strength / 100

        setImageManipulated : ( image ) ->

            @imageManipulated = image


    # @method fromObject
    # @static
    #
    Image.fromObject = ( object, callback ) ->

        deferred = jQuery.Deferred()
        img      = document.createElement "img"

        img.onload = () ->

            model = new Image( img, object )

            deferred.resolve model

            if callback then callback model

            img = img.onload = img.onerror = null

        img.onerror = () ->

            deferred.resolve()

            img = img.onload = img.onerror = null

        img.src = object.src

        return deferred.promise()

    return Image