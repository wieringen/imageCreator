# @module info
# @author mbaijs
#
define [

    # Template.
    #
    "text!templates/info.html"

    # Core.
    #
,   "cs!config"

], (moduleHTML, config) ->

    $ = jQuery

    module =
        enabled : true
        options : config.options.ui.info

    $imageCreatorViewport = null

    $module          = null
    $layerName       = null
    $layerRotation   = null
    $layerPositionX  = null
    $layerPositionY  = null
    $layerSizeWidth  = null
    $layerSizeHeight = null

    # The curent layer that is being edited.
    #
    layerCurrent = false

    module.initialize = ->

        # Append module HTML.
        #
        $(module.options.target).replaceWith moduleHTML

        # Get main DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")

        # Get module DOM elements.
        #
        $module          = $(module.options.target)
        $layerName       = $module.find ".objectName"
        $layerRotation   = $module.find ".rotation"
        $layerPositionX  = $module.find ".positionX"
        $layerPositionY  = $module.find ".positionY"
        $layerSizeWidth  = $module.find ".sizeWidth"
        $layerSizeHeight = $module.find ".sizeHeight"

        # Listen for global events.
        #
        $.subscribe "layerSelect", infoUpdate
        $.subscribe "layerUpdate", infoUpdate

    infoUpdate = (event, layer, partial) ->

        $layerPositionX.text Math.round(layer and layer.positionRotated.x or 0)
        $layerPositionY.text Math.round(layer and layer.positionRotated.y or 0)

        if not partial

            $layerName.text if layer.name then layer.name else ""

            # If the current selected layer is a text layer use its text value as the value for the info box name field.
            #
            if layer.text

                $layerName.text layer.text.replace "<br/>", ""

            $layerRotation.text Math.round(layer and layer.rotation.degrees  or 0)
            $layerSizeWidth.text Math.round(layer and layer.sizeCurrent.width or 0)
            $layerSizeHeight.text Math.round(layer and layer.sizeCurrent.height or 0)

    return module