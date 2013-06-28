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
        module.snippets.$gripSnippet = $imageCreatorSelection.find(".grip").remove()

        # Populate the module UI.
        #
        populateUI()

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
                left   : layer.positionRotated.x  - module.options.offset
                top    : layer.positionRotated.y  - module.options.offset
                width  : layer.sizeRotated.width  + module.options.offset
                height : layer.sizeRotated.height + module.options.offset

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

        layerCurrent    = cache.getLayerActive()
        layerScaleStart = layerCurrent.fontSize or layerCurrent.scale
        gripName        = $(event.target).parent().data("grip")
        scaleSliceY     = 2 / ( layerCurrent.sizeRotated.height / layerScaleStart )
        scaleSliceX     = 2 / ( layerCurrent.sizeRotated.width  / layerScaleStart )
        deltaScale      = 0
        mouse           =
            x : event.pageX
            y : event.pageY

        $("body").addClass "noSelect"

        # Mehhh....
        #
        $(document).on "mousemove.selection", (event) ->

            quantifierY = scaleSliceY * Math.abs(event.pageY - mouse.y)
            quantifierX = scaleSliceX * Math.abs(event.pageX - mouse.x)

            if gripName is "N"

                deltaScale = if event.pageY > mouse.y then (deltaScale - quantifierY) else (deltaScale + quantifierY)

            # if gripName === "NE"

            if gripName is "E"

                deltaScale = if event.pageX > mouse.x then (deltaScale + quantifierX) else (deltaScale - quantifierX)

            # if gripName === "SE"

            if gripName is "S"

                deltaScale = if event.pageY > mouse.y then (deltaScale + quantifierY) else (deltaScale - quantifierY)

            # if( gripName === "SW" )

            if gripName is "W"

                deltaScale = if event.pageX > mouse.x then (deltaScale - quantifierX) else (deltaScale + quantifierX)

            # if( gripName === "NW" )

            if layerCurrent.setFontSize

                layerCurrent.setFontSize layerScaleStart + deltaScale
            else

                layerCurrent.setScale layerScaleStart + deltaScale

            mouse.x = event.pageX
            mouse.y = event.pageY

            $.publish "layerUpdate", [layerCurrent]
            $.publish "selectionScale", [layerCurrent.fontSize or layerCurrent.scale, true]

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