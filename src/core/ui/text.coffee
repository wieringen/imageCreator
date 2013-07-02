# @module text
#
define [

    # Template.
    #
    "text!templates/text.html"

    # Core.
    #
,   "cs!config"
,   "cs!cache"
,   "cs!model/text"
,   "cs!util/math"

    # Libraries.
    #
,   "plugins/jquery.tabular"
,   "plugins/jquery.colorPicker"

], (moduleHTML, config, cache, modelText, utilMath) ->

    $ = jQuery

    module =
        enabled  : true
        options  : config.options.ui.text
        snippets : {}

    $imageCreatorViewport = null

    $module         = null
    $textEdit       = null
    $textColor      = null
    $textWeightBtn  = null
    $textStyleBtn   = null
    $textFontSelect = null
    $textAlignBtn   = null

    # The curent layer that is being edited.
    #
    layerCurrent = false
    editing      = false

    module.initialize = ->

        # Append module HTML.
        #
        $(module.options.target).replaceWith moduleHTML

        # Get basic app DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")

        # Get module DOM elements.
        #
        $module         = $(module.options.target)
        $textEdit       = $(".imageCreatorSelectionTextEdit")
        $textColor      = $module.find ".textColor"
        $textWeightBtn  = $module.find ".textWeightBtn"
        $textStyleBtn   = $module.find ".textStyleBtn"
        $textFontSelect = $module.find ".textFontSelect"
        $textAlignBtn   = $module.find ".textAlignBtn"

        # Initialize module UI.
        #
        $module.tabular
            menu  : ".moduleMenu"
            tabs  : "a"
            pages : ".moduleTab"

        $textColor.colorPicker()

        # Listen for module UI events.
        #
        $textEdit.bind "keydown keyup blur change", textSet
        $textColor.bind "colorUpdate", textColor
        $textWeightBtn.click textWeight
        $textStyleBtn.click textStyle
        $textFontSelect.change textFont
        $textAlignBtn.click textAlign

        # Listen for global events.
        #
        $.subscribe "layerSelect", layerSelect
        $.subscribe "layerEdit", layerEdit
        $.subscribe "layerUpdate", layerUpdate
        $.subscribe "layerVisibility", layerVisibility

        # temp
        #
        $(".buttonTextAdd").click textAdd

    layerVisibility = (event, layer) ->

        if layer.selected

            # We only want to set the module ui state when were toggling the visibility of the currently selected layer.
            #
            layerSelect event, layer, true

            $textEdit.toggle editing and layer.visible

    layerSelect = (event, layer, keepEditing) ->

        # Enable module if layer is visible and can have text.
        #
        module.enabled = layer.visible and layer.canHaveText
        $module.toggleClass "moduleDisabled", not module.enabled

        # If we are in editing mode and we dont persist on editing stop editing mode.
        #
        if ! keepEditing and editing

            layerEdit event, false

        if module.enabled

            layerCurrent = layer

            # Set the UI to match the selected layers properties.
            #
            $textColor.trigger "setColor", [layerCurrent.color]
            $textWeightBtn.toggleClass "active", layerCurrent.weight is "bold"
            $textStyleBtn.toggleClass "active", layerCurrent.style is "italic"
            $textFontSelect.val layerCurrent.font
            $textAlignBtn.removeClass "active"
            $textAlignBtn.filter("[data-align=#{layerCurrent.textAlign}]").addClass("active")

    layerEdit = (event, layer) ->

        if module.enabled and layer.canHaveText

            editing = true

            $textEdit.val layer.text

            layerUpdate event, layer

            $textEdit.focus()

        else
            editing = false

            $textEdit.hide()

    layerUpdate = (event, layer) ->

        if module.enabled and layer.canHaveText and editing

            editProperties =
                left       : layer.position.x
                top        : layer.position.y
                textAlign  : layer.textAlign
                fontWeight : layer.weight
                display    : "block"
                lineHeight : Math.floor(layer.fontSize * layer.lineHeight) + "px"
                fontSize   : layer.fontSize
                fontFamily : layer.font
                transform  : "rotate(#{layer.rotation.degrees}deg)"

            if layer.textRegion

                editProperties.width   = layer.textRegion.width  * layer.scale
                editProperties.height  = layer.textRegion.height * layer.scale
                editProperties.top    += layer.textRegion.top    * layer.scale
                editProperties.left   += layer.textRegion.left   * layer.scale

            else
                editProperties.width  = layer.sizeCurrent.width
                editProperties.height = layer.sizeCurrent.lineHeight

            $textEdit.css editProperties

    textAdd = ->

        text  = module.options.defaultText
        layer =
            text : text.slice 0, utilMath.getRandomInt(10, text.length)

        cache.setLayerActive new modelText(layer)

        return false

    textStyle = (event) ->

        if module.enabled and layerCurrent?.visible

            isItalic = layerCurrent.style is "italic"

            layerCurrent.setStyle( if isItalic then "normal" else "italic" )

            $textStyleBtn.toggleClass "active", not isItalic

            $.publish "layerUpdate", [layerCurrent]

        return false

    textWeight = (event) ->

        if module.enabled and layerCurrent?.visible

            isBold = layerCurrent.weight is "bold"

            layerCurrent.setWeight( if isBold then "normal" else "bold" )

            $textWeightBtn.toggleClass "active", not isBold

            $.publish "layerUpdate", [layerCurrent]

        return false

    textFont = (event) ->

        if module.enabled and layerCurrent?.visible

            layerCurrent.setFont @.value

            $.publish "layerUpdate", [layerCurrent]

    textColor = (event, color) ->

        if module.enabled and layerCurrent?.visible

            layerCurrent.setColor color

            $.publish "layerUpdate", [layerCurrent]

    textAlign = (event) ->

        if module.enabled and layerCurrent?.visible

            layerCurrent.setTextAlign $(@).attr("data-align")

            $textAlignBtn.removeClass "active"

            $(@).addClass "active"

            $.publish "layerUpdate", [layerCurrent]

        return false

    textSet = (event) ->

        if module.enabled and layerCurrent?.visible

            layerCurrent.setText @.value

            $.publish "layerUpdate", [layerCurrent]

    return module