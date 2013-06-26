# @module svg
#
define [

    # Template.
    #
    "text!templates/svg.html"

    # App core modules
    #
    "config"
    "cache"

], ( moduleHTML, config, cache ) ->

    $ = jQuery

    module =
        name : "svg"
        snippets : {}

    $imageCreatorViewport = null
    $imageCreatorCanvas   = null

    svgContainer = null
    svgDefs      = null
    svgSelect    = null

    canvasWidth  = null
    canvasHeight = null

    module.initialize = () ->

        # Get basic app DOM elements.
        #
        $imageCreatorViewport = $( ".imageCreatorViewport" )
        $imageCreatorCanvas   = $( ".imageCreatorCanvas" )

        # Append module HTML.
        #
        $imageCreatorCanvas.html moduleHTML

        # Get module DOM elements.
        #
        svgContainer = $imageCreatorCanvas.find( "svg" )[0]
        svgDefs      = $imageCreatorCanvas.find( "defs" )[0]
        svgSelect    = $imageCreatorCanvas.find( "rect" )[0]

        # Set the viewport's dimensions.
        #
        canvasWidth  = config.options.viewport.width
        canvasHeight = config.options.viewport.height

        svgContainer.setAttribute "width", canvasWidth
        svgContainer.setAttribute "height", canvasHeight

        $imageCreatorViewport.css
            width  : canvasWidth
            height : canvasHeight

        # Remove other engines that may be listening.
        #
        $.unsubscribe ".engine"

        # Listen to global app events.
        #
        $.subscribe "layerUpdate.engine", svgLayerCheck
        $.subscribe "layerSelect.engine", svgLayerCheck
        $.subscribe "layerVisibility.engine", svgLayerVisibility
        $.subscribe "layerRemove.engine", svgLayerRemove
        $.subscribe "layersRedraw.engine", svgBuildLayers

        # Get module snippets.
        #
        module.snippets.svgFilter = $( svgDefs ).find( "filter" )[0]

        # Do we have any layers allready?
        #
        svgBuildLayers()

    svgBuildLayers = () ->

        $( svgContainer ).find( "text, filter, image" ).remove()

        for layer in cache.getLayers()

            eventType = if layer.selected then "layerSelect" else "layerUpdate"

            svgLayerCheck { type : eventType }, layer

    svgLayerCheck = ( event, layer, partial ) ->

        if layer

            # If we dont have a layer in the dom its new so create it.
            #
            if 0 is $( "#" + layer.id + module.name ).length

                svgLayerCreate event, layer

            # Update layer properties
            #
            svgLayerUpdate event, layer, partial

        # Set the selection rectangle around the current layer or hide it.
        #
        svgLayerSelect event, layer

    svgLayerCreate = ( event, layer ) ->

        # Create DOM object from layer object.
        #
        if "image" is layer.type

            svgLayerCurrent = document.createElementNS "http://www.w3.org/2000/svg", "image"
            svgLayerCurrent.setAttributeNS "http://www.w3.org/1999/xlink", "href", layer.image.src
            svgLayerCurrent.setAttribute "filter", "url(#" + layer.id + "filter)"

            svgLayerFilter = $( module.snippets.svgFilter ).clone()
            svgLayerFilter.attr "id", layer.id + "filter"

            svgLayerFilterColorMatrix = svgLayerFilter.find( "feColorMatrix" )[0]
            svgLayerFilterColorMatrix.setAttribute "result", layer.id + "result"

            svgLayerFilterComposite = svgLayerFilter.find( "feComposite" )[0]
            svgLayerFilterComposite.setAttribute "in", layer.id + "result"

            svgDefs.appendChild svgLayerFilter[0]

            svgLayerCurrent.setAttribute "width", layer.sizeReal.width
            svgLayerCurrent.setAttribute "height", layer.sizeReal.height

        if "text" is layer.type

            svgLayerCurrent = document.createElementNS "http://www.w3.org/2000/svg", "text"

        svgLayerCurrent.setAttribute "id", layer.id + module.name

        # Append new layer to DOM and reappend the selection layer so its always on top.
        #
        svgContainer.appendChild svgLayerCurrent
        svgContainer.appendChild svgSelect

    svgLayerUpdate = ( event, layer, partial ) ->

        svgLayerCurrent = $( "#" + layer.id + module.name )[0]

        # Update the text part of the layer
        #
        if "text" is layer.type and ! partial

            $( svgLayerCurrent ).find( "tspan" ).remove()

            svgLayerCurrent.setAttribute "height", layer.sizeCurrent.height
            svgLayerCurrent.setAttribute "width", layer.sizeCurrent.width

            textAnchorMap =
                "left"   : "start"
                "center" : "middle"
                "right"  : "end"

            textAlignPositionMap =
                "start"  : 0
                "middle" : 0.5
                "end"    : 1

            $( svgLayerCurrent ).css({
                fill       : layer.color
                fontSize   : layer.fontSize
                fontFamily : layer.font
                fontWeight : layer.weight
                fontStyle  : layer.style
                textAnchor : textAnchorMap[ layer.textAlign ]
            })

            domFragment = document.createDocumentFragment()

            for line, index in layer.textLines

                tspannode = document.createElementNS "http://www.w3.org/2000/svg", "tspan"

                # IE9 doesn't support this so i will have to make a hack in this browser to presere whitespace :(
                #
                tspannode.setAttributeNS "http://www.w3.org/XML/1998/namespace", "xml:space", "preserve"

                tspannode.setAttribute "x", 0
                tspannode.setAttribute "y", 0

                tspannode.setAttribute "dx", layer.sizeCurrent.width * textAlignPositionMap[ textAnchorMap[ layer.textAlign ] ]
                tspannode.setAttribute "dy", ( index * Math.floor( layer.fontSize * layer.lineHeight ) ) + layer.fontSize + "px"

                tspannode.textContent = line

                domFragment.appendChild tspannode

            svgLayerCurrent.appendChild domFragment

        # Update the image part of the layer
        #
        if "image" is layer.type and ! partial

            svgLayerFilterColorMatrix = $( "#" + layer.id + "filter" ).find( "feColorMatrix" )[0]

            if layer.filter.matrix

                svgLayerFilterColorMatrix.setAttribute "values", layer.filter.matrix.join(" ")

                svgLayerFilterComposite = $( "#" + layer.id + "filter" ).find( "feComposite" )[0]
                svgLayerFilterComposite.setAttribute "k2", layer.filter.strength
                svgLayerFilterComposite.setAttribute "k3", 1 - layer.filter.strength

            else

                svgLayerFilterColorMatrix.removeAttribute "values"

        svgLayerCurrent.setAttribute "visibility", if layer.visible then "visible" else "hidden"

        m = layer.matrix
        svgLayerCurrent.setAttribute "transform", "matrix( #{ m[0] }, #{ m[3] }, #{ m[1] }, #{ m[4] }, #{ m[2] }, #{ m[5] } )"

    svgLayerSelect = ( event, layer ) ->

        # If we have a layer change selection properties to match its dimensions.
        #
        if layer and layer.selected

            m = layer.matrix
            svgSelect.setAttribute "transform", "matrix( #{ m[0] }, #{ m[3] }, #{ m[1] }, #{ m[4] }, #{ m[2] }, #{ m[5] } )"

            if "text" is layer.type

                svgSelect.setAttribute "height", layer.sizeCurrent.height
                svgSelect.setAttribute "width",  layer.sizeCurrent.width

            if layer.locked

                svgSelect.setAttribute "visibility", "hidden"

                return false

        # If we have no layer to select or if its hidden hide the selection rectangle as well.
        #
        if event.type isnt "layerUpdate"

            svgSelect.setAttribute "visibility", ( if layer.visible and layer.selected then "visible" else "hidden" )

            # When the layer is a image set the selection to match the image its real size so we can reuse the image projection matrix.
            # Text layers dont need this because text is not scaled.
            # Since these values never change for the sake of performance we want to set this on layer selection rather then layer update.
            #
            if "image" is layer.type

                svgSelect.setAttribute "height", layer.sizeReal.height
                svgSelect.setAttribute "width", layer.sizeReal.width

    svgLayerVisibility = ( event, layer ) ->

        $( "#" + layer.id + module.name ).attr "visibility", if layer.visible then "visible" else "hidden"

        # We only want to toggle the selection layer if its around the currently selected layer.
        #
        if layer.selected

            svgSelect.setAttribute "visibility", if layer.visible then "visible" else "hidden"

    svgLayerRemove = ( event, layerId ) ->

        $( "#" + layerId + module.name ).remove()
        $( "#" + layerId + "filter" ).remove()

    return module