# @module layers
#
define [

    # Template
    #
    "text!templates/layers.html"

    # Core
    #
,   "cs!config"
,   "cs!cache"

    # Libraries.
    #
,   "plugins/jquery.tabular"
,   "plugins/jquery.sortable"

], ( moduleHTML, config, cache ) ->

    $ = jQuery

    module =
        engines  : config.options.engines
        options  : config.options.ui.layers
        snippets : {}

    $imageCreatorViewport = null

    $module             = null
    $layersContainer    = null
    $selectRenderEngine = null
    $buttonImageSave    = null
    $emptyMessage       = null

    module.initialize = ->

        # Append module HTML.
        #
        $(module.options.target).replaceWith moduleHTML

        # Get main DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")

        # Get module DOM elements.
        #
        $module             = $(module.options.target)
        $layersContainer    = $module.find ".layersContainer"
        $selectRenderEngine = $module.find ".selectRenderEngine"
        $buttonImageSave    = $(".buttonImageSave")
        $emptyMessage       = $module.find ".emptyMessage"

        # Initialize module UI.
        #
        $module.tabular
            menu  : ".moduleMenu"
            tabs  : "a"
            pages : ".moduleTab"

        # Listen for module UI events.
        #
        $layersContainer.delegate ".layer", "tap", layerSelectByID
        $layersContainer.delegate ".layerToggle", "tap", layerVisibilityById
        $layersContainer.delegate ".layerRemove", "tap", layerRemoveByID
        $selectRenderEngine.change optionRenderEngineSelect
        $buttonImageSave.bind "tap", () ->
            cache.storeProject()

            $.publish "message", {
                message : JSON.stringify( cache.getProject() )
                status  : "error"
                fade    : false
            }

        # Listen for global events.
        #
        $.subscribe "layerSelect", layerCheck
        $.subscribe "layerRemove", layerRemove
        $.subscribe "layerVisibility", layerVisibility
        $.subscribe "layersRedraw", layersRedraw

        # Get module snippets.
        #
        module.snippets.$layerSnippet  = $module.find(".layer").remove()
        module.snippets.$engineSnippet = $module.find(".selectRenderEngineItem").remove()

        # Populate the module UI.
        #
        populateUI()

        # Do we have any layers allready?
        #
        layersRedraw()

    populateUI = ->

        # Add all the supported engines.
        #
        for engineName, engineKey in module.engines.order

            engine = module.engines.types[engineName]

            if engine.support

                $engineClone = module.snippets.$engineSnippet.clone()

                #$engineClone.attr( "selected", engineName === config.engine.name )
                $engineClone.attr "value", engineName
                $engineClone.data "engine", engineName
                $engineClone.text engineName

                $selectRenderEngine.append $engineClone

    layersRedraw = ->

        $layersContainer.find(".layer").remove()

        $.each cache.getLayers(), layerCheck

    layerCheck = (event, layer) ->

        if layer and 0 is $("#layer" + layer.id).length

            layerCreate event, layer

        if layer.selected or event.type

            layerSelect event, layer


    layerCreate = (event, layer) ->

        $emptyMessage.hide()

        $layerClone = module.snippets.$layerSnippet.clone()
        $layerClone.attr "id", "layer" + layer.id

        if layer.image

            $layerClone.find(".layerName").text layer.name
            $layerClone.find("img").attr "src", layer.image.src

        if layer.text

            $layerClone.find(".layerName").text layer.text
            #$layerClone.find( "img" ).attr( "src", objectLayer.image.src )

        $layersContainer.prepend($layerClone)

    layerSelectByID = (event) ->

        layerID = $(@).attr("id").replace "layer", ""

        cache.setLayerActiveByID layerID

        return false

    layerSelect = (event, layer) ->

        $layersContainer.find(".active").removeClass "active"
        $("#layer" + layer.id).addClass "active"

    layerRemoveByID = (event) ->

        layerID = $(@).parent().attr("id").replace "layer", ""

        cache.removeLayerByID layerID

        return false

    layerRemove = (event, layerID) ->

        $("#layer" + layerID).remove()

        # Show empty message if we have no more layers.
        #
        if 0 is $layersContainer.find(".layer").length

            $emptyMessage.show()

    layerVisibilityById = (event) ->

        layerID = $(@).parent().attr("id").replace "layer", ""
        layer   = cache.getLayerById layerID

        layer.set "visible", not layer.visible

        $.publish "layerVisibility", [ layer ]

        return false

    layerVisibility = (event, layer) ->

        $("#layer" + layer.id).toggleClass "hideLayer", layer.visibility

        return false

    optionRenderEngineSelect = (event) ->

        $.publish "loadEngine", $(@).find(":selected").data "engine"

    return module