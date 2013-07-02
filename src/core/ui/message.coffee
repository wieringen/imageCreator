# @module message
#
define [

    # Template.
    #
    "text!templates/message.html"

    # Core.
    #
,   "cs!config"

], (moduleHTML, config) ->

    $ = jQuery

    module =
        enabled : true
        options : config.options.ui.message

    messageDefaults =
        message   : ""
        status    : ""
        fade      : true
        fadeTimer : 300

    $imageCreatorViewport = null

    $module       = null
    $message      = null
    $messageInner = null
    $messageClose = null

    module.initialize = ->

        # Append module HTML.
        #
        $(module.options.target).replaceWith moduleHTML

        # Get main DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")

        # Get module DOM elements.
        #
        $message      = $(".imageCreatorUIMessage")
        $messageInner = $(".imageCreatorMessageInner")
        $messageClose = $(".imageCreatorMessageClose")

        # Listen for module UI events.
        #
        $messageClose.on "tap", messageClose

        # Listen for global events.
        #
        $.subscribe "message", messageBroadcast

    messageBroadcast = (event, parameters) ->

        options      = $.extend {}, messageDefaults, parameters
        messageTimer = $message.data "messageTimer"

        $message.removeClass "error loading notice"
        $message.addClass options.status
        $message.show()

        $messageInner.text options.message

        if options.fade

            clearTimeout messageTimer

            messageTimer = setTimeout( () ->

                $message.hide()

            , options.fadeTimer )

            $message.data "messageTimer", messageTimer

    messageClose = ->

        $message.hide()

    return module