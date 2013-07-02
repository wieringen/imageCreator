# @module layer
#
define [

    # App core modules.
    #
    "cs!config"
,   "cs!util/math"
,   "cs!util/misc"

], ( config, utilMath, utilMisc ) ->

    module =

        options : {}

    # @class Layer
    # @constructor
    #
    class Layer

        id    : ""
        name  : ""
        type  : ""
        plane : "baseline"

        visible : true

        # When this flag is true the layer wont be selectable or moveable.
        #
        locked : false

        # If this is the current selected layer in the app this flag will be true.
        #
        selected : false

        # Unrotated size.
        #
        sizeCurrent :
            width  : 0
            height : 0

        # Unrotated position.
        #
        position :
            x : 0
            y : 0

        # Rotated size.
        #
        sizeRotated :
            width  : 0
            height : 0

        # rotated position.
        #
        positionRotated :
            x : 0
            y : 0

        # Difference between unrotated and rotated size.
        #
        offset :
            x : 0
            y : 0

        # Projection matrix.
        #
        matrix : [ 1, 0, 0, 0, 1, 0 ]

        scale : 1

        rotation :
            degrees : 0
            radians : 0
            sin     : 0
            cos     : 1

        constructor : (options) ->

            if options then @setOptions options

        setOptions : (options) ->

            for property of options

                @set property, options[property]

        toObject : (propertiesToInclude) ->

            ownProperties =

                id              : @id
                name            : @name
                plane           : @plane

                locked          : @locked

                sizeCurrent     : @sizeCurrent
                position        : @position

                sizeRotated     : @sizeRotated
                positionRotated : @positionRotated

                offset          : @offset

                scale           : @scale
                rotation        : @rotation
                matrix          : @matrix

            utilMisc.populateWithProperties this, ownProperties, propertiesToInclude

            return ownProperties

        get : (property) ->

            return @[property]

        _set : (key, value) ->

            @[key] = value

            return this

        set : (key, value) ->

            if typeof key is "object"

                for property of key

                    @_set property, key[property]

            else

                if typeof value is "function"

                    @_set key, value( @get( key ) )

                else

                    @_set key, value

            return this

        setRotate : (rotation) ->

            @rotation    = rotation
            @sizeRotated = utilMath.getBoundingBox @sizeCurrent, @rotation

            @setPosition { x : 0, y: 0 }

        setPosition : (delta) ->

            @position =
                x : @position.x + delta.x
                y : @position.y + delta.y

            @offset =
                x : ( @sizeRotated.width  - @sizeCurrent.width )  / 2
                y : ( @sizeRotated.height - @sizeCurrent.height ) / 2

            @positionRotated =
                x : @position.x - @offset.x
                y : @position.y - @offset.y

            @setPositionConstrain
                width  : config.options.viewport.width
                height : config.options.viewport.height

            @matrix = utilMath.getMatrix @rotation, @scale, @position, ( @sizeReal or @sizeCurrent )

        setPositionConstrain : (grid) ->

            ratio =
                width  : grid.width  - this.sizeRotated.width
                height : grid.height - this.sizeRotated.height

            if @positionRotated.x <= 0 + ( if ratio.width < 0 then ratio.width else 0 )

                @positionRotated.x = if ratio.width < 0 then ratio.width else 0

            if @positionRotated.y <= 0 + ( if ratio.height < 0 then ratio.height else 0 )

                @positionRotated.y = if ratio.height < 0 then ratio.height else 0

            if @positionRotated.x + ( if ratio.width < 0 then ratio.width else 0 ) >= ratio.width

                @positionRotated.x = if ratio.width < 0 then 0 else ratio.width

            if @positionRotated.y + ( if ratio.height < 0 then ratio.height else 0 ) >= ratio.height

                @positionRotated.y = if ratio.height < 0 then 0 else ratio.height

            @position =
                x : @positionRotated.x + @offset.x
                y : @positionRotated.y + @offset.y

    return Layer