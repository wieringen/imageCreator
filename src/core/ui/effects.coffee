# @module effects
#
define [

    # Template.
    #
    "text!templates/effects.html"

    # Core.
    #
,   "cs!config"
,   "cs!cache"
,   "cs!util/misc"

    # Libraries.
    #
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"

], (moduleHTML, config, cache, utilMisc) ->

    $ = jQuery

    module =
        enabled  : true
        options  : config.options.ui.effects
        snippets : {}

    $imageCreatorViewport = null

    $filterStrength = null
    $filterTypeList = null
    $maskTypeList   = null
    $module         = null

    layerCurrent = false

    module.initialize = (options) ->

        # Append module HTML.
        #
        $(module.options.target).replaceWith moduleHTML

        # Get main DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")

        # Get module DOM elements.
        #
        $module         = $( module.options.target )
        $filterStrength = $module.find ".filterStrength"
        $filterTypeList = $module.find ".filterTypeList"
        $maskTypeList   = $module.find ".maskTypeList"

        # Initialize module UI.
        #
        $module.tabular
            menu  : ".moduleMenu"
            tabs  : "a"
            pages : ".moduleTab"

        $filterStrength.slider
            start : 100
            scale : [0, 100]
            unit  : "%"

        # Listen for module UI events.
        #
        $filterStrength.bind "onDrag", filterStrength
        $filterTypeList.change filterType
        $maskTypeList.change maskType

        # Listen for global events.
        #
        $.subscribe "layerSelect", layerSelect
        $.subscribe "layerVisibility", layerVisibility

        # Get snippets.
        #
        module.snippets.$filterTypeSnippet = $module.find(".filterTypeOption").remove()
        module.snippets.$maskTypeSnippet   = $module.find(".maskTypeOption").remove()

        # Populate the module ui.
        #
        populateUI()

    populateUI = ->

        for keyFilter, filter of module.options.filters.color

            $filterTypeClone = module.snippets.$filterTypeSnippet.clone()

            $filterTypeClone.attr "value", keyFilter
            $filterTypeClone.text filter.name

            $filterTypeList.append $filterTypeClone

        for keyMask, mask of module.options.masks

            $maskTypeClone = module.snippets.$maskTypeSnippet.clone()

            $maskTypeClone.attr "value", keyMask
            $maskTypeClone.text mask.name

            $maskTypeList.append $maskTypeClone

    layerVisibility = (event, layer) ->

        if layer.selected

            # We only want to set the module ui state when were toggling the visibility of the currently selected layer.
            #
            layerSelect event, layer

    layerSelect = (event, layer) ->

        # Enable module if the layer supports filters.
        #
        module.enabled = layer.visible and ( layer.canHaveFilter or layer.canHaveMask )

        $module.toggleClass "moduleDisabled", not module.enabled
        $module.toggleClass "moduleLocked", not layer.locked

        if module.enabled

            layerCurrent = layer

            # Set the UI to match the selected layers properties.
            #
            $filterTypeList.val layerCurrent.filter.name.toLowerCase()
            $maskTypeList.val layerCurrent.mask.name.toLowerCase()

            if layerCurrent.filter.matrix

                $filterStrength.removeClass "disabled"
                $filterStrength.trigger "setPosition", [layerCurrent.filter.strength * 100]

            else

                $filterStrength.addClass "disabled"

    filterType = (event) ->

        if module.enabled and layerCurrent and layerCurrent.visible

            layerCurrent.setImageManipulated null

            layerCurrent.setFilter $.extend(true, {}, module.options.filters.color[@.value])

            $filterStrength.toggleClass "disabled", not layerCurrent.filter.matrix

            $filterStrength.trigger "setPosition", [layerCurrent.filter.strength * 100]

            $.publish "layerUpdate", [layerCurrent]

    filterStrength = (event, strength) ->

        if module.enabled and layerCurrent and layerCurrent.visible

            layerCurrent.setImageManipulated null

            layerCurrent.setFilterStrength strength

            $.publish "layerUpdate", [layerCurrent]

    maskType = (event) ->

        if module.enabled and layerCurrent and layerCurrent.visible

            layerCurrent.setImageManipulated null

            layerCurrent.setMask module.options.masks[@.value]

            $.publish "layerUpdate", [layerCurrent]

    return module