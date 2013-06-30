# @module selection
#
define [
    # Template.
    #
    "text!templates/selection.html"

    # Core.
    #
,   "config"
,   "cache"
,   "cs!util/math"
,   "cs!util/detect"

], (moduleHTML, config, cache, utilMath, utilDetect) ->

    $ = jQuery

    module =
        options : config.options.ui.selection
        snippets : {}

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
        $imageCreatorViewport.on "mousedown mousemove", ( event ) ->

            if not editLock
                event.preventDefault()

        $(document).on "keydown", selectionKeyDown
        $(document).on "keyup", selectionKeyUp

        # Listen for global events.
        #
        $.subscribe "layerUpdate", selectionUpdate
        $.subscribe "layerSelect", selectionSelect
        $.subscribe "layerEdit", selectionEdit
        $.subscribe "layerVisibility", selectionVisibility

        # Get snippets.
        #
        #module.snippets.$gripSnippet = $imageCreatorSelection.find(".grip").remove()

        # Populate the module UI.
        #
        #populateUI()

    populateUI = ->

        # Only create grips if we have mouse events.
        #
        if not utilDetect.NO_MOUSEEVENTS

            for grip, index in module.options.grips

                $gripClone = module.snippets.$gripSnippet.clone()

                $gripClone.addClass "grip" + grip
                $gripClone.data "grip", grip

                $gripClone.find( ".gripScale" ).css( "cursor", grip.toLowerCase() + "-resize" )

                $imageCreatorSelection.append $gripClone

    selectionSelect = (event, layer) ->

        selectionEdit event, false
        selectionUpdate event, layer

    selectionUpdate = (event, layer) ->

        if layer

            $imageCreatorSelection.css
                left   : layer.position.x  - module.options.offset
                top    : layer.position.y  - module.options.offset
                width  : layer.sizeCurrent.width  + module.options.offset
                height : layer.sizeCurrent.height + module.options.offset
                transform  : "rotate(#{layer.rotation.degrees}deg)"


        $imageCreatorSelection.toggle layer && layer.visible and not layer.locked

    selectionEdit = (event, layer) ->

        $imageCreatorSelection.toggleClass "editing", layer

        if layer
            editing  = true
            editLock = layer.canHaveText
        else
            editing  = false
            editLock = false

    selectionKeyDown = (event) ->

        if event.shiftKey

            shiftKeyEnabled = true

    selectionKeyUp = (event) ->

        shiftKeyEnabled = false

    selectionVisibility = (event, layer) ->

        if layer.selected and not layer.locked

            $imageCreatorSelection.toggle layer.visible

    selectionScale = (event) ->

        layerCurrent = cache.getLayerActive()
        layerWidth   = layerCurrent.sizeCurrent.width
        layerHeight  = layerCurrent.sizeCurrent.height
        layerScale   = layerCurrent.scale
        aspectRatio  = layerWidth / layerHeight
        mouseX       = event.pageX
        mouseY       = event.pageY

        # Get the current grip and compensate if the layer is rotated.
        #
        gripPosition =
            x : event.pageX - $imageCreatorSelection.offset().left - (layerCurrent.sizeRotated.width  / 2)
            y : event.pageY - $imageCreatorSelection.offset().top  - (layerCurrent.sizeRotated.height / 2)

        gripRadians = utilMath.sanitizeRadians Math.atan2(gripPosition.x, -gripPosition.y)
        gripDegrees = utilMath.toDegrees gripRadians
        gripIndex   = Math.round(gripDegrees / (360 / module.options.grips.length))
        gripIndex   = 0 if gripIndex is module.options.grips.length
        gripName    = module.options.grips[gripIndex].toLowerCase()

        # Mapping of in which direction the width and height need to scale when a grip is triggerd.
        #
        dir =
            e: (dx, dy) -> width: layerWidth + dx
            w: (dx, dy) -> width: layerWidth - dx
            n: (dx, dy) -> height: layerHeight - dy
            s: (dx, dy) -> height: layerHeight + dy
            se: (dx, dy) -> $.extend dir.s(dx, dy), dir.e(dx, dy)
            sw: (dx, dy) -> $.extend dir.s(dx, dy), dir.w(dx, dy)
            ne: (dx, dy) -> $.extend dir.n(dx, dy), dir.e(dx, dy)
            nw: (dx, dy) -> $.extend dir.n(dx, dy), dir.w(dx, dy)

        $("body").addClass "noSelect"

        $(document).on "mousemove.selection", (event) ->

            # We need to multiply these values by 2 because we are not scaling from a corner but from the center.
            #
            dx = ( (event.pageX - mouseX) or 0 ) * 2
            dy = ( (event.pageY - mouseY) or 0 ) * 2

            # The layer's adjusted dimensions
            #
            LayerDimNew = dir[gripName] dx, dy

            # Make sure the layer respects the aspect ratio.
            #
            if LayerDimNew.width

                LayerDimNew.height = LayerDimNew.width / aspectRatio

            else if LayerDimNew.height

                LayerDimNew.width  = LayerDimNew.height * aspectRatio

            # Scale by fontsize or dimensions?
            #
            if layerCurrent.scaleByFontSize

                newFontSize = Math.round( LayerDimNew.width * layerCurrent.fontSize / layerCurrent.sizeCurrent.width )
                layerCurrent.setFontSize newFontSize

                $.publish "selectionScale", [ layerCurrent.fontSize, true]

            else

                newScale = ( LayerDimNew.width * 1 / layerCurrent.sizeReal.width )
                layerCurrent.setScale newScale

                $.publish "selectionScale", [ layerCurrent.scale, true]

            # Redraw, Cache
            #
            $.publish "layerUpdate", [layerCurrent]

        $(document).on "mouseup.selection", (event) ->

            $(document).unbind ".selection"
            $("body").removeClass "noSelect"

            return false

        return false

    selectionRotate = (event) ->

        event.preventDefault()

        layerCurrent            = cache.getLayerActive()
        layerStartRadians       = layerCurrent.rotation.radians
        selectionOffset         = $imageCreatorSelection.offset()
        gripPositionCenterStart =
            x : event.pageX - selectionOffset.left - (layerCurrent.sizeRotated.width  / 2)
            y : event.pageY - selectionOffset.top  - (layerCurrent.sizeRotated.height / 2)

        gripOffsetRadians = utilMath.sanitizeRadians(Math.atan2(gripPositionCenterStart.x, -gripPositionCenterStart.y))
        slice             = Math.PI * 2 / module.options.grips.length

        $("html").addClass "noSelect cursorRotate"

        $(document).on "mousemove.selection", (event) ->

            event.preventDefault()

            gripPositionCenter =
                x : event.pageX - $imageCreatorSelection.offset().left - (layerCurrent.sizeRotated.width  / 2)
                y : event.pageY - $imageCreatorSelection.offset().top  - (layerCurrent.sizeRotated.height / 2)

            gripCurrentRadians = utilMath.sanitizeRadians(Math.atan2(gripPositionCenter.x, -gripPositionCenter.y))
            radians            = utilMath.sanitizeRadians(layerStartRadians + gripCurrentRadians - gripOffsetRadians)

            if shiftKeyEnabled
                radians = Math.round(radians * 1000 / (slice * 1000)) * slice

            layerCurrent.setRotate
                radians : radians
                degrees : utilMath.toDegrees(radians)
                sin     : Math.sin(radians)
                cos     : Math.cos(radians)

            $.publish "layerUpdate", [layerCurrent, true]
            $.publish "selectionRotate", [layerCurrent.rotation, true]

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

        return false;

    selectionPinch = (event) ->

        event.gesture.preventDefault()

        layerCurrent      = cache.getLayerActive()
        layerRadiansStart = layerCurrent.rotation.radians
        layerScaleStart   = layerCurrent.fontSize or layerCurrent.scale
        deltaScale        = event.gesture.scale
        multiplierScale   = if layerCurrent.fontSize then 20 else 0.75

        $(document).on "transform.selection", (event) ->

            radians  = utilMath.sanitizeRadians(layerRadiansStart + utilMath.toRadians(event.gesture.rotation))
            scale    = layerScaleStart + ((event.gesture.scale - deltaScale) * multiplierScale)
            rotation =
                radians : radians
                degrees : utilMath.toDegrees( radians )
                sin     : Math.sin( radians )
                cos     : Math.cos( radians )

            if not editLock and layerCurrent and layerCurrent.visible

                layerCurrent.setRotate rotation

                if layerCurrent.setFontSize

                    layerCurrent.setFontSize scale
                else

                    layerCurrent.setScalescale

                $.publish "layerUpdate", [layerCurrent]
                $.publish "selectionRotate", [layerCurrent.rotation, true]
                $.publish "selectionScale", [layerCurrent.fontSize or layerCurrent.scale, true]

            return false

        $(document).on "transformend.selection", (event) ->

            $(document).unbind ".selection"

            return false

    selectionTap = (event) ->

        layerActive = cache.getLayerActive()
        offset      = $imageCreatorViewport.offset()
        layerFound  = false
        mouse       =
            x : event.gesture.center.pageX - offset.left
            y : event.gesture.center.pageY - offset.top

        for layer, index in cache.getLayers()

            if layer.plane is "baseline"

                if utilMath.isPointInPath(mouse, layer.sizeCurrent, layer.position, layer.rotation.radians)

                    if layerActive.id is layer.id

                        $.publish "layerEdit", [layerActive]

                    else

                        cache.setLayerActiveByID layer.id

                    layerFound = true

        if not layerFound and editing

            $.publish "layerEdit", [false]

    return module