# @module text
# @author mbaijs
#
define [

    # Template.
    #
    "text!templates/navigation.html"

    # Core.
    #
,   "cs!config"
,   "cs!cache"

], (moduleHTML, config, cache ) ->

    $ = jQuery

    module =
        enabled  : true
        options  : config.options.ui.navigation
        snippets : {}

    project     = cache.getProject()

    $buttonRedo = null
    $buttonUndo = null
    $buttonPrev = null
    $buttonNext = null
    $buttonSave = null

    module.initialize = ->

        # Append module HTML.
        #
        $(module.options.target).replaceWith moduleHTML

        # Get basic app DOM elements.
        #
        $imageCreatorViewport = $(".imageCreatorViewport")

        # Get module DOM elements.
        #
        $module     = $(module.options.target)
        $buttonRedo = $module.find ".buttonRedo"
        $buttonUndo = $module.find ".buttonUndo"
        $buttonPrev = $module.find ".buttonPrev"
        $buttonNext = $module.find ".buttonNext"
        $buttonSave = $module.find ".buttonSave"

        $module.css "width", project.viewport.width

        # Listen for module UI events.
        #
        $buttonRedo.click redo
        $buttonUndo.click undo
        $buttonPrev.click prev
        $buttonNext.click next
        $buttonSave.bind "tap", () ->
            cache.storeProject()

            $.publish "message", {
                message : JSON.stringify( cache.getProject() )
                status  : "error"
                fade    : false
            }

        $buttonPrev.hide()
        $buttonNext.text "Go to " + cache.getProject().views[1].name


    undo = ->

    redo = ->

    prev = ->

        project      = cache.getProject()
        currentView  = cache.getViewActive()
        currentIndex = 0

        for view, viewIndex in project.views

            if currentView.name is view.name

                currentIndex = viewIndex

        prevView = project.views[currentIndex - 1]

        if prevView
            cache.setViewActive prevView.name

        $buttonNext.show().text "Go to " + currentView.name

        if project.views[currentIndex - 2]
            $buttonPrev.show().text "Go to " + project.views[currentIndex - 2].name
        else
            $buttonPrev.hide()

        return false

    next = ->

        project      = cache.getProject()
        currentView  = cache.getViewActive()
        currentIndex = 0

        for view, viewIndex in project.views

            if currentView.name is view.name

                currentIndex = viewIndex

        nextView = project.views[currentIndex + 1]

        if nextView
            cache.setViewActive nextView.name

        $buttonPrev.show().text "Go to " + currentView.name

        if project.views[currentIndex + 2]
            $buttonNext.show().text "Go to " + project.views[currentIndex + 2].name
        else
            $buttonNext.hide()

        return false

    return module