# @module canvas
#
define [

    # App core modules
    #
    "cs!config"
    "cs!cache"
    "cs!util/math"

    "plugins/canvg/canvg"

], (config, cache, utilMath) ->

    $ = jQuery

    module  =
        name    : "canvas"
        options : config.options.engines

    $imageCreatorViewport = null
    $imageCreatorCanvas   = null

    canvas       = null
    context      = null
    canvasWidth  = null
    canvasHeight = null

    editing      = false

    module.initialize = ->

        # Get basic app DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")
        $imageCreatorCanvas   = $(".imageCreatorCanvas")

        # Set the viewport's dimensions.
        #
        canvasWidth  = config.options.viewport.width
        canvasHeight = config.options.viewport.height

        $imageCreatorViewport.css
            width  : canvasWidth
            height : canvasHeight

        # Create and add Canvas.
        #
        canvas  = document.createElement "canvas"
        context = canvas.getContext "2d"

        canvas.setAttribute "width", canvasWidth
        canvas.setAttribute "height", canvasHeight

        $imageCreatorCanvas.html canvas

        # Remove other engines that may be listening.
        #
        $.unsubscribe ".engine"

        # Listen to global app events.
        #
        $.subscribe "layerUpdate.engine", canvasBuildLayers
        $.subscribe "layerEdit.engine", layerEdit
        $.subscribe "layerSelect.engine", layerSelect
        $.subscribe "layerVisibility.engine", canvasBuildLayers
        $.subscribe "layerRemove.engine", canvasBuildLayers
        $.subscribe "layersRedraw.engine", canvasBuildLayers

        # Do we have any layers allready?
        #
        canvasBuildLayers()

    layerSelect = (event, layer) ->

        editing = false

        canvasBuildLayers event

    layerEdit = (event, layer) ->

        editing = if layer then true else false

        canvasBuildLayers event

    canvasBuildLayers = ( event ) ->

        layers       = cache.getLayers()
        layerCurrent = cache.getLayerActive()

        # Empty canvas.
        #
        context.clearRect 0, 0, canvasWidth, canvasHeight

        # Draw all the layers.
        #
        for layer in layers

            # If layer is visible than draw it.
            #
            if layer.visible

                canvasLayerCreate event, layer

        # Set the selection rectangle around the current layer.
        #
        if layerCurrent and layerCurrent.visible

            canvasLayerSelect event, layerCurrent

    wrapText = (context, text, maxWidth, scale) ->

        words   = text.split " "
        lineNew = ""
        lines   = []

        # loop trew all the words in the line
        #
        for word, wordIndex in words

            # Check the size of the word
            #
            wordWidth = context.measureText(word).width * scale

            # If the word is bigger then the actual space we have we not to loop trew all the chars as well
            # because we need to now on what char to split the word.
            #
            if wordWidth > maxWidth

                # Words that are bigger then maxWidth always start on a new line.
                #
                if lineNew.length > 0
                    lines.push {text : lineNew}

                lineNew = ""
                chars   = word.split ""

                for char, charIndex in chars

                    lineNewWidth = context.measureText(lineNew + char).width * scale

                    if lineNewWidth > maxWidth

                        lines.push {text : lineNew}

                        # New beginning of the next line.
                        #
                        lineNew = char

                    else
                        lineNew += char

                lineNew += " "

            else
                lineNewWidth = context.measureText(lineNew + word).width * scale

                if lineNewWidth > maxWidth

                    lines.push {text : lineNew}

                    # New beginning of the next line.
                    #
                    lineNew = word + " "
                else

                    # There is still some room in this line so add the word it.
                    #
                    lineNew += word + " "

        lines.push {text : lineNew}

        return lines

    canvasLayerCreate = (event, layer) ->

        # Save the current state ( matrix, clipping, etc ).
        #
        context.save()

        # Change the matrix state of the canvas so it reflects the new layer we want to create.
        #
        m = layer.matrix
        context.setTransform m[ 0 ], m[ 3 ], m[ 1 ], m[ 4 ], m[ 2 ], m[ 5 ]

        # Create the image part of the layer
        #
        if layer.canHaveImage

            # If the layer is selected we also want to show the part that is hiden by the clipping mask.
            # So we have to rerender the filter and mask to do this.
            #
            if event and event.type is "layerSelect"

                if layer.canHaveMask or layer.canHaveFilter

                    layer.setImageManipulated null

            # Draw the image and use its real size the matrix applied above will do the scaling for us.
            #
            context.drawImage getImage( context, layer ), 0, 0, layer.sizeReal.width, layer.sizeReal.height

        # Create the text part of the layer. Dont create the text if we are editing a layer.
        #
        if layer.canHaveText and ( not editing or not layer.selected )

            context.fillStyle = layer.color
            context.textAlign = layer.textAlign
            textAlignDivider  = {"left" : 0, "center" : 0.5, "right" : 1}[ layer.textAlign ]
            context.font      = "#{layer.style} #{layer.weight} #{layer.fontSize / layer.scale}px #{layer.font}"
            realIndex         = -1

            if layer.textRegion

                textLeft      = ((layer.textRegion.left * layer.scale) + ((layer.textRegion.width * layer.scale) * textAlignDivider)) / layer.scale
                textRegionTop = layer.textRegion.top * layer.scale

            else
                textLeft      = layer.sizeCurrent.width * textAlignDivider / layer.scale
                textRegionTop = 0

            # We have to create a seperate container for every text line.
            #
            for line, index in layer.textLines

                textTop = (index * Math.floor(layer.fontSize * layer.lineHeight) + layer.fontSize + textRegionTop) / layer.scale

                if layer.textRegion

                    realIndex += 1
                    lineParts = wrapText( context, line, layer.textRegion.width * layer.scale, layer.scale )

                    for linePart, linePartIndex in lineParts

                        if linePartIndex > 0
                            realIndex += 1

                        context.fillText(
                            linePart.text,
                            textLeft,
                            (realIndex * Math.floor(layer.fontSize * layer.lineHeight) + layer.fontSize + textRegionTop) / layer.scale
                        )
                else
                    context.fillText(
                        line,
                        textLeft,
                        textTop
                    )

        # Restore the state of the canvas to the saved state.
        #
        context.restore()

    canvasLayerSelect = ( event, layer ) ->

        # Save the current state ( matrix, clipping, etc ).
        #
        context.save()

        # Change the matrix state of the canvas so it reflects the selection.
        #
        m = layer.matrix
        context.setTransform m[ 0 ], m[ 3 ], m[ 1 ], m[ 4 ], m[ 2 ], m[ 5 ]

        # Set the color of the selection
        #
        context.strokeStyle = module.options.selectionColor

        # We want a dashed line for our stroke. To bad that not all browsers support this so we have to check can use it.
        #
        if context.setLineDash

           context.setLineDash [ module.options.selectionDash / layer.scale ]

        # The stroke must stay consistent in size so we need to cancel out the scaling effect.
        #
        context.lineWidth = 1 / layer.scale

        # Create the actual selection the size is either based on the actual normal image size or in case of text on the actual container size.
        #
        context.strokeRect(
            0
        ,   0
        ,   ( if layer.sizeReal then layer.sizeReal.width else layer.sizeCurrent.width )
        ,   ( if layer.sizeReal then layer.sizeReal.height else layer.sizeCurrent.height )
        )

        # Restore the state of the canvas to the saved state.
        #
        context.restore()

    getImage = (context, layer) ->

        # No filter or mask defined return normal image.
        #
        if ! ( layer.filter and layer.filter.matrix ) and ! ( layer.mask and layer.mask.src )

            return layer.image
        else

            # Do we allready have a image processed with a filter in mem? Use that.
            #
            if layer.imageManipulated

                return layer.imageManipulated

            # If we have nothing in memory create one.
            #
            else
                layer.setImageManipulated applyImageManipulations( layer )

                return layer.imageManipulated

    applyImageManipulations = (layer) ->

        copyCanvas  = document.createElement "canvas"
        copyContext = copyCanvas.getContext "2d"

        # Set the copy canvas to reflect the layer size.
        #
        copyCanvas.setAttribute "width", layer.sizeReal.width
        copyCanvas.setAttribute "height", layer.sizeReal.height

        # Does this layer have a mask?
        #
        if layer.canHaveMask and layer.mask.src

            # If the layer is selected we want to show the parts of the image the mask cuts off.
            #
            if layer.selected

                copyContext.save()

                copyContext.globalAlpha = 0.5
                copyContext.fillStyle   = "#666"

                copyContext.drawImage layer.image, 0, 0, layer.sizeReal.width, layer.sizeReal.height
                copyContext.fillRect 0, 0, layer.sizeReal.width, layer.sizeReal.height

                copyContext.restore()

            # Draw the mask to the canvas
            #
            copyContext.beginPath()
            copyContext.drawSvg layer.mask.src, layer.mask.x, layer.mask.y, layer.mask.width, layer.mask.width / layer.mask.ratio
            copyContext.clip()
            copyContext.clearRect layer.mask.x, layer.mask.y, layer.mask.width, layer.mask.width

        # Draw the layer to the canvas
        #
        copyContext.drawImage layer.image, 0, 0, layer.sizeReal.width, layer.sizeReal.height

        # Does this layer have a filter?
        #
        if layer.canHaveFilter and layer.filter.matrix

            # Get the pixel data from the canvas
            #
            canvasData = copyContext.getImageData 0, 0, layer.sizeReal.width, layer.sizeReal.height

            # We need the total length of the pixel data.
            #
            canvasDataLength = layer.sizeReal.width * layer.sizeReal.height * 4

            # Add a filter to the pixel data.
            #
            processColorFilter canvasData.data, layer.filter, canvasDataLength

            # Put back the processed image in the copy canvas.
            #
            copyContext.putImageData canvasData, 0, 0

        return copyCanvas

    colorDistance = (scale, dest, src) ->

        return (scale * dest + (1 - scale) * src)

    processColorFilter = (binaryData, filter, len) ->

        m   = filter.matrix
        s   = filter.strength
        m4  = m[4]  * 255
        m9  = m[9]  * 255
        m14 = m[14] * 255
        m19 = m[19] * 255
        i   = 0

        while i < len

            r = binaryData[i]
            g = binaryData[i + 1]
            b = binaryData[i + 2]

            binaryData[i]     = colorDistance(s, (r * m[0])  + (g * m[1])  + (b * m[2]), r)  + m4
            binaryData[i + 1] = colorDistance(s, (r * m[5])  + (g * m[6])  + (b * m[7]), g)  + m9
            binaryData[i + 2] = colorDistance(s, (r * m[10]) + (g * m[11]) + (b * m[12]), b) + m14

            i += 4

    return module