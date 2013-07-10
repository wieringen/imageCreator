# @module math
# @author mbaijs
#
define [], () ->

    module = {}

    module.sanitizeRadians = (radians) ->

        max = 2 * Math.PI

        return if ( radians < 0 )
        then ( max + radians )
        else ( if radians > max then radians - max else radians )

    module.toRadians = (degrees) ->

        return degrees * ( Math.PI / 180 )

    module.toDegrees = (radians) ->

        return radians * 180 / Math.PI

    module.getBoundingBox = (sizeUnrotated, rotation) ->

        sin = Math.abs rotation.sin
        cos = Math.abs rotation.cos

        width  : sizeUnrotated.height * sin + sizeUnrotated.width * cos
        height : sizeUnrotated.height * cos + sizeUnrotated.width * sin

    module.getMatrix = (rotation, scale, position, size) ->

        sin = scale * rotation.sin
        cos = scale * rotation.cos

        # Translate origin to center of layer.
        #
        matrixPre =
        [
            1, 0, scale * ( size.width / 2 )
        ,   0, 1, scale * ( size.height / 2 )
        ,   0, 0, 1
        ]

        # Scale, rotate and translate to the layer's position.
        #
        matrix =
        [
            cos, -sin, position.x
        ,   sin,  cos, position.y
        ,   0,    0,   1
        ]

        # Translate origin back to top left of layer.
        #
        matrixPost =
        [
            1, 0, -( size.width  / 2 )
        ,   0, 1, -( size.height / 2 )
        ,   0, 0, 1
        ]

        return module.matrixMultiply( matrixPre, module.matrixMultiply( matrix, matrixPost ) )

    module.matrixMultiply = (a, b) ->

        # Cache matrix values.
        #
        a0 = a[0]
        a1 = a[1]
        a2 = a[2]
        a3 = a[3]
        a4 = a[4]
        a5 = a[5]
        a6 = a[6]
        a7 = a[7]
        a8 = a[8]

        b0 = b[0]
        b1 = b[1]
        b2 = b[2]
        b3 = b[3]
        b4 = b[4]
        b5 = b[5]
        b6 = b[6]
        b7 = b[7]
        b8 = b[8]

        # Multiply matrixes.
        #
        return [
            a0 * b0 + a1 * b3 + a2 * b6
        ,   a0 * b1 + a1 * b4 + a2 * b7
        ,   a0 * b2 + a1 * b5 + a2 * b8

        ,   a3 * b0 + a4 * b3 + a5 * b6
        ,   a3 * b1 + a4 * b4 + a5 * b7
        ,   a3 * b2 + a4 * b5 + a5 * b8

        ,   a6 * b0 + a7 * b3 + a8 * b6
        ,   a6 * b1 + a7 * b4 + a8 * b7
        ,   a6 * b2 + a7 * b5 + a8 * b8
        ]

    module.getDistance = (pos1, pos2) ->

        x = pos2.x - pos1.x
        y = pos2.y - pos1.y

        return Math.sqrt x * x + y * y

    module.getRandomInt = (min, max) ->

        return Math.floor( Math.random() * (max - min + 1) ) + min

    module.rotateAroundPoint = (point, origin, rotation) ->

        cos =  rotation.cos
        sin = -rotation.sin

        x : cos * (point.x-origin.x) - sin * (point.y-origin.y) + origin.x
        y : sin * (point.x-origin.x) + cos * (point.y-origin.y) + origin.y

    module.isPointInPath = (mouse, size, position, radians) ->

        dx   = mouse.x - ( position.x + ( size.width / 2 ) )
        dy   = mouse.y - ( position.y + ( size.height / 2 ) )

        h1   = Math.sqrt dx * dx + dy * dy
        newA = Math.atan2( dy, dx ) - radians

        x2   = Math.cos( newA ) * h1
        y2   = Math.sin( newA ) * h1

        return yes if -0.5 * size.width  < x2 < 0.5 * size.width and
                      -0.5 * size.height < y2 < 0.5 * size.height

    return module
