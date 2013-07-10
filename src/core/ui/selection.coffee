# @module selection
# @author mbaijs
#
define [
    # Template.
    #
    "text!templates/selection.html"

    # Core.
    #
,   "cs!config"
,   "cs!cache"
,   "cs!util/math"
,   "cs!util/detect"

], (moduleHTML, config, cache, utilMath, utilDetect) ->

    $ = jQuery

    module =
        options : config.options.ui.selection

    $imageCreatorViewport = null
    $imageCreatorCanvas   = null

    $imageCreatorSelection = null

    shiftKeyEnabled = false
    editing         = false
    editLock        = false

    module.initialize = ->

        # Append module HTML.
        #
        $(module.options.target).append moduleHTML

        # Get main DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")
        $imageCreatorCanvas   = $(".imageCreatorCanvas")

        # Get module DOM elements.
        #
        $imageCreatorSelection = $(".imageCreatorSelection")

        # Listen to module UI events.
        #
        $imageCreatorCanvas.on "tap", selectionTap
        $imageCreatorSelection.delegate ".gripScale", "mousedown", selectionScale
        $imageCreatorSelection.delegate ".gripRotate", "mousedown", selectionRotate
        $imageCreatorSelection.delegate ".gripRemove", "tap", selectionRemove
        $imageCreatorViewport.on "dragstart", selectionPosition
        $imageCreatorViewport.on "transformstart", selectionPinch
        $imageCreatorViewport.on "mousedown mousemove", (event) ->

            if not editLock
                event.preventDefault()

        $(document).on "keydown", selectionKeyDown
        $(document).on "keyup", selectionKeyUp
        $(document).on "touchmove", (event) ->
            event.preventDefault()

        # Listen for global events.
        #
        $.subscribe "layerUpdate", layerUpdate
        $.subscribe "layerSelect", layerSelect
        $.subscribe "layerEdit", layerEdit
        $.subscribe "layerVisibility", layerVisibility

        # Scaling and rotating will be done by pinching.
        #
        if utilDetect.NO_MOUSEEVENTS

            $(".gripScale, .gripRotate").hide()

    layerSelect = (event, layer) ->

        layerEdit event, false
        layerUpdate event, layer

    layerUpdate = (event, layer) ->

        if layer

            $imageCreatorSelection.css
                left   : layer.position.x  - module.options.offset
                top    : layer.position.y  - module.options.offset
                width  : layer.sizeCurrent.width  + module.options.offset
                height : layer.sizeCurrent.height + module.options.offset
                transform  : "rotate(#{layer.rotation.degrees}deg)"

        $imageCreatorSelection.toggle layer and layer.visible and not layer.locked

    layerEdit = (event, layer) ->

        if layer
            editing  = true
            editLock = layer.canHaveText
        else
            editing  = false
            editLock = false

        $imageCreatorSelection.toggleClass "editing", layer and editing

    layerVisibility = (event, layer) ->

        if layer.selected and not layer.locked

            $imageCreatorSelection.toggle layer.visible

    selectionKeyDown = (event) ->

        if event.shiftKey

            shiftKeyEnabled = true

    selectionKeyUp = (event) ->

        shiftKeyEnabled = false

    selectionScale = (event) ->

        event.preventDefault()

        layerCurrent   = cache.getLayerActive()
        layerRotation  = layerCurrent.rotation
        viewportOffset = $imageCreatorViewport.offset()

        layerCenterPosition =
            y : layerCurrent.positionRotated.y + layerCurrent.sizeRotated.height / 2
            x : layerCurrent.positionRotated.x + layerCurrent.sizeRotated.width  / 2

        $("body").addClass "noSelect"

        $(document).on "mousemove.selection", (event) ->

            event.preventDefault()

            # Position of the grip relative to the viewport of the selection.
            #
            gripPosition =
                x : event.pageX - viewportOffset.left
                y : event.pageY - viewportOffset.top

            localPoint   = utilMath.rotateAroundPoint gripPosition, layerCenterPosition, layerRotation
            lastDistance = layerCurrent.position.x + layerCurrent.sizeCurrent.width + layerCurrent.position.y + layerCurrent.sizeCurrent.height
            NewDistance  = localPoint.x + localPoint.y

            if layerCurrent.scaleByFontSize
                layerCurrent.setFontSize layerCurrent.fontSize * NewDistance / lastDistance

                $.publish "selectionScale", [ layerCurrent.fontSize, true]
            else
                layerCurrent.setScale layerCurrent.scale * NewDistance / lastDistance

                $.publish "selectionScale", [ layerCurrent.scale, true]

            # Redraw
            #
            $.publish "layerUpdate", [layerCurrent]

        $(document).on "mouseup.selection", (event) ->

            $(document).unbind ".selection"
            $("body").removeClass "noSelect"

            return false

        return false

    selectionRotate = (event) ->

        event.preventDefault()

        layerCurrent    = cache.getLayerActive()
        layerRadians    = layerCurrent.rotation.radians
        selectionOffset = $imageCreatorSelection.offset()
        slice           = Math.PI * 2 / module.options.grips.length

        # Position of the grip relative to the center of the selection.
        #
        gripPosition =
            x : event.pageX - selectionOffset.left - layerCurrent.sizeRotated.width  / 2
            y : event.pageY - selectionOffset.top  - layerCurrent.sizeRotated.height / 2

        # Get the initial angle of the current grip.
        #
        gripRadians = utilMath.sanitizeRadians Math.atan2(gripPosition.x, -gripPosition.y)

        $("html").addClass "noSelect cursorRotate"

        $(document).on "mousemove.selection", (event) ->

            event.preventDefault()

            # Find out what angle the grip is pointing now.
            #
            gripPositionCurrent =
                x : event.pageX - $imageCreatorSelection.offset().left - layerCurrent.sizeRotated.width  / 2
                y : event.pageY - $imageCreatorSelection.offset().top  - layerCurrent.sizeRotated.height / 2

            gripRadiansCurrent = utilMath.sanitizeRadians Math.atan2(gripPositionCurrent.x, -gripPositionCurrent.y)

            # Calculate what angle we need to rotate the layer.
            #
            layerRadiansCurrent = utilMath.sanitizeRadians(layerRadians + gripRadiansCurrent - gripRadians)

            # If the shift key is pressed we only want to rotate by magnitudes of 90 degrees.
            #
            if shiftKeyEnabled
                layerRadiansCurrent = Math.round(layerRadiansCurrent * 1000 / (slice * 1000)) * slice

            layerCurrent.setRotate
                radians : layerRadiansCurrent
                degrees : utilMath.toDegrees(layerRadiansCurrent)
                sin     : Math.sin(layerRadiansCurrent)
                cos     : Math.cos(layerRadiansCurrent)

            # Set UI
            #
            $.publish "selectionRotate", [layerCurrent.rotation, true]

            # Redraw
            #
            $.publish "layerUpdate", [layerCurrent, true]

        $(document).on "mouseup.selection", (event) ->

            $(document).unbind ".selection"
            $("html").removeClass "noSelect cursorRotate"

            return false

        return false

    selectionPosition = (event) ->

        event.gesture.preventDefault()

        layerCurrent = cache.getLayerActive()
        mouse =
            x : event.gesture.deltaX
            y : event.gesture.deltaY

        $("html").addClass "noSelect cursorGrabbing"

        $(document).on "drag.selection", (event) ->

            if not editLock and layerCurrent and layerCurrent.visible

                layerCurrent.setPosition
                    x : event.gesture.deltaX - mouse.x
                    y : event.gesture.deltaY - mouse.y

                $.publish "layerUpdate", [layerCurrent, true]

            mouse.x = event.gesture.deltaX
            mouse.y = event.gesture.deltaY

        $(document).bind "dragend.selection", (event) ->

            $(document).unbind ".selection"
            $("html").removeClass "noSelect cursorGrabbing"

            return false

    selectionRemove = (event) ->

        event.preventDefault()

        cache.removeLayer cache.getLayerActive()

        return false

    selectionPinch = (event) ->

        event.gesture.preventDefault()

        layerCurrent      = cache.getLayerActive()
        layerRadiansStart = layerCurrent.rotation.radians
        layerScaleStart   = if layerCurrent.scaleByFontSize then layerCurrent.fontSize else layerCurrent.scale
        deltaScale        = event.gesture.scale
        multiplierScale   = if layerCurrent.scaleByFontSize then 20 else 0.75

        $(document).on "transform.selection", (event) ->

            radians  = utilMath.sanitizeRadians(layerRadiansStart + utilMath.toRadians(event.gesture.rotation))
            scale    = layerScaleStart + ((event.gesture.scale - deltaScale) * multiplierScale)
            rotation =
                radians : radians
                degrees : utilMath.toDegrees( radians )
                sin     : Math.sin( radians )
                cos     : Math.cos( radians )

            if not editLock and layerCurrent and layerCurrent.visible and layerCurrent.plane is "baseline"
                layerCurrent.setRotate rotation

                if layerCurrent.scaleByFontSize
                    layerCurrent.setFontSize scale

                else
                    layerCurrent.setScale scale

                $.publish "layerUpdate", [layerCurrent]
                $.publish "selectionRotate", [layerCurrent.rotation, true]
                $.publish "selectionScale", [(if layerCurrent.scaleByFontSize then layerCurrent.fontSize else layerCurrent.scale), true]

            return false

        $(document).on "transformend.selection", (event) ->

            $(document).unbind ".selection"

            return false

    selectionTap = (event) ->

        layerActive    = cache.getLayerActive()
        offset         = $imageCreatorViewport.offset()
        layersToEdit   = []
        layersToSelect = []
        mouse          =
            x : event.gesture.center.pageX - offset.left
            y : event.gesture.center.pageY - offset.top

        for layer, index in cache.getLayers()

            if utilMath.isPointInPath mouse, layer.sizeCurrent, layer.position, layer.rotation.radians

                if layerActive.id is layer.id

                    layersToEdit.push layer

                else
                    layersToSelect.push layer

        # Editing of layers has precendence above selecting a new layer
        #
        if layersToEdit.length > 0 and
           layerActive.canHaveText or
           layerActive.canHaveMask and
           layerActive.mask.src

            $.publish "layerEdit", [layersToEdit.pop()]

        # If there are no layers to edit try to select a new one
        #
        else if layersToSelect.length > 0

            document.activeElement.blur()

            cache.setLayerActiveByID layersToSelect.pop().id

        else if editing

            document.activeElement.blur()

            $.publish "layerEdit", [false]

        return false

    return module