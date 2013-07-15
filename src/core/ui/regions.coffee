# @module regions
# @author mbaijs
#
define [

    # Template.
    #
    "text!templates/regions.html"

    # Core.
    #
,   "cs!config"
,   "cs!cache"
,   "cs!model/image"

    # Libraries.
    #
,   "plugins/jquery.tabular"

], (moduleHTML, config, cache, modelImage) ->

    $ = jQuery

    module =
        name     : "regions"
        enabled  : true
        options  : config.options.ui.regions
        snippets : {}

    $imageCreatorViewport = null

    $module = null

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
        $module = $(module.options.target)

        # Initialize module UI.
        #
        $module.tabular
            menu  : ".moduleMenu"
            tabs  : "a"
            pages : ".moduleTab"

        # Listen for module UI events.
        #

        # Listen for global events.
        #
        $.subscribe "layersRedraw", layersRedraw
        $.subscribe "layerSelect", layerSelect
        $.subscribe "layerVisibility", layerSelect

        # Temp
        #

    layersRedraw = (event) ->

        view           = cache.getViewActive()
        module.enabled = typeof view.regions is "object"

        $module.toggleClass "moduleDisabled", not module.enabled

    layerSelect = (event, layer) ->



    imageAdd = (url) ->

        layer =
            src   : @src or= url
            scale : 0.3335
            plane : "baseline"

        modelImage.fromObject layer, (instance) ->

            cache.setLayerActive instance

        return false

    return module