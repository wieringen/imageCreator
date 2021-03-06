# @module misc
# @author mbaijs
#
define [], () ->

    $ = jQuery

    module = {}

    module.populateWithProperties = (source, destination, properties) ->

        if properties and Object.prototype.toString.call( properties ) is "[object Array]"

            for property in properties

                destination[ property ] = source[ property ]

    module.measureText = (layer, overwrite) ->

        measureDiv = document.createElement "div"

        measureDiv.className = "imageCreatorMeasureText"

        document.body.appendChild measureDiv

        measureDiv.style.fontSize   = layer.fontSize + "px"
        measureDiv.style.fontFamily = layer.font
        measureDiv.style.fontWeight = layer.weight
        measureDiv.style.lineHeight = layer.lineHeight
        measureDiv.style.backgroundColor = "#ccc"

        if overwrite and overwrite.width
            measureDiv.style.width      = overwrite.width + "px"
            measureDiv.style.whiteSpace = "pre-wrap"
            measureDiv.style.wordWrap   = "break-word"
        else
            measureDiv.style.width = "auto"

        if window.attachEvent and not window.addEventListener

            measureDiv.innerHTML = (overwrite and overwrite.text) or layer.text
        else
            jQuery( measureDiv ).text (overwrite and overwrite.text) or layer.text

        textWidth  = measureDiv.clientWidth  + 10
        textHeight = measureDiv.clientHeight

        document.body.removeChild measureDiv

        measureDiv = null

        return { width : textWidth, height : textHeight }


    module.whenAll = (promises) ->

        return jQuery.when.apply( jQuery, promises ).pipe () ->

            return jQuery.grep Array.prototype.slice.call( arguments ), (value) ->

                return (value)

    module.loadModules = (modules, prefix, callback) ->

        urls  = []
        names = []

        for moduleName of modules

            urls.push( prefix + moduleName )
            names.push( moduleName )

        require urls, () ->

            resultSet = []

            for module, i in arguments

                resultSet[ names[ i ] ] = module

            callback resultSet

    module.getImageFromURL = (url, success, error) ->

        img = document.createElement "img"

        img.onload = ->

            if success then success img

            img = img.onload = img.onerror = null

        img.onerror = ->

            if error then error

            img = img.onload = img.onerror = null

        img.src = url

    return module
