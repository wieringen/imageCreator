# @module library
# @author mbaijs
#
define [

    # Template.
    #
    "text!templates/library.html"

    # Core.
    #
,   "cs!config"
,   "cs!cache"
,   "cs!model/image"
,   "cs!model/balloon"

    # Libraries.
    #
,   "plugins/jquery.tabular"
,   "plugins/jquery.dropArea"

], (moduleHTML, config, cache, modelImage, modelBalloon) ->

    $ = jQuery

    module =
        name     : "library"
        enabled  : true
        options  : config.options.ui.library
        snippets : {}

    $imageCreatorViewport = null

    $module              = null
    $libraryUploadSubmit = null
    $libraryUploadFrame  = null
    $libraryUploadForm   = null

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
        $module              = $(module.options.target)
        $libraryUploadSubmit = $module.find ".libraryUploadSubmit"
        $libraryUploadFrame  = $module.find "#libraryUploadFrame"
        $libraryUploadForm   = $module.find ".libraryUploadForm"

        # Initialize module UI.
        #
        $module.tabular
            menu  : ".moduleMenu"
            tabs  : "a"
            pages : ".moduleTab"

        $imageCreatorViewport.dropArea
            callback : imageAdd

        # Listen for module UI events.
        #
        $libraryUploadSubmit.bind "click", imageUpload

        # Listen for global events.
        #
        $.subscribe "layerSelect", layerSelect
        $.subscribe "layerVisibility", layerSelect

        # Temp
        #
        $(".imageDecorationsList").delegate "img", "tap", imageAdd
        $(".imageBackgroundsList").delegate "img", "tap", backgroundAdd
        $(".imageBalloonsList").delegate "img", "tap", balloonAdd
        $(".buttonImageAdd").click ->

            cache.setLayerActive false

            $module.removeClass "moduleDisabled"

            return false

    layerSelect = (event, layer) ->

        $module.addClass "moduleDisabled"

    imageUpload = ->

        # Temp!!! Just used for debugging puposes.
        #
        $libraryUploadForm.submit()
        $libraryUploadFrame.unbind("load").load (event) ->

            json = $.parseJSON $(@).contents().text()

            if json and json.code isnt 200

                $.publish "message", {
                    message  : json.message
                    status   : "error"
                    fade     : false
                }

            else

                imageAdd json.src

        return false

    backgroundAdd = (url) ->

        layer =
            src      : @src or= url
            scale    : 1
            locked   : true
            plane    : "background"
            position :
                x : 0
                y : 0

        modelImage.fromObject layer, (instance) ->

            cache.setLayerActive instance

        return false

    imageAdd = (url) ->

        layer =
            src   : @src or= url
            scale : 0.3335
            plane : "baseline"

        modelImage.fromObject layer, (instance) ->

            cache.setLayerActive instance

        return false

    balloonAdd = (url) ->

        layer =
            src   : @src or= url
            scale : 0.3335
            plane : "foreground"
            text  : "Dit is een tekstje"
            textRegion :
                height : 325
                left   : 120
                top    : 93
                width  : 535

        modelBalloon.fromObject layer, (instance) ->

            cache.setLayerActive instance

        return false

    return module