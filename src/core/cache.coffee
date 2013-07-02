# @module cache
# @author mbaijs
#
define [

    "cs!config"
,   "cs!util/misc"

,   "plugins/jquery.storage"

], ( config, utilMisc ) ->

    $ = jQuery

    module = {}

    # Cache keys
    #
    keyProject = "ImageCreatorProject"

    # Private cache variables
    #
    project =
        views :
            front :
                layers : []
    layers = []

    viewActive  = false
    layerActive = false

    module.initialize = ->

        # Save the state of the canvas when the app is unloaded.
        #
        $(window).unload module.storeProject

        # Load saved cache.
        #
        module.loadProject()

    module.loadProject = (projectData, viewName) ->

        project = projectData or $.parseJSON $.Storage.get(keyProject)

        module.setViewActive viewName or "front"

    module.storeProject = ->

        layersToSave = []

        # Loop to all the layers of this view and turn them into objects.
        #
        for layer, layerIndex in layers

            layersToSave.push layer.toObject()

        viewActive.layers = layersToSave

        $.Storage.set keyProject, JSON.stringify(project)

    module.getProject = ->

        return project

    module.setViewActive = (viewName) ->

        if project and project.views and project.views[viewName]

            viewActive = project.views[viewName]

            module.loadLayers viewActive.layers

    module.getViewActive = ->

        return viewActive

    module.getLayers = ->

        return layers

    module.loadLayers = (layersData) ->

        promises = []

        if layersData

            # Get all the models we have.
            #
            utilMisc.loadModules config.options.models, "cs!model/", (models) ->

                modelType = ""

                for layer, layerIndex in layersData

                    modelType = layer.type

                    # Convert our layer object to a layer model.
                    #
                    if models[modelType]

                        promises.push models[modelType].fromObject(layer)

                # When all promises are resolved set them in the cache
                #
                utilMisc.whenAll(promises).done module.setLayers

    module.setLayers = (layersData) ->

        for layer, layerIndex in layersData

            module.setLayer layer

        $.publish "layersRedraw"

        return layersData

    module.setLayer = (layerData) ->

        if layerData.plane is "background"

            # We only want 1 background layer so remove all others.
            #
            for layer, layerIndex in layers

                if layer.plane is "background"

                    module.removeLayer layer

            layers.unshift layerData

            $.publish "layersRedraw"

        else

            layers.push layerData

        return layerData

    module.setLayerActive = (layerData) ->

        isNewLayer = true

        if typeof layerData is "object"

            for layer, layerIndex in layers

                # Unset all the selected flags in all cached layers
                #
                layer.set "selected", false

                # If the layer already is present in our cache reference it.
                #
                if layer.id is layerData.id

                    layerActive = layerData

                    isNewLayer = false

            # If the layer is new first add it to our cache then reference it.
            #
            if isNewLayer

                module.setLayer layerData

                layerActive = layerData

            layerActive.set "selected", true

        else

            layerActive = false

        $.publish "layerSelect", [layerActive]

        return layerActive

    module.setLayerActiveByID = (layerID) ->

        return module.setLayerActive module.getLayerById(layerID)

    module.getLayerActive = ->

        return layerActive

    module.getLayerById = (layerID) ->

        layerFound = false

        if layerID

            for layer, layerIndex in layers

                if layer.id is layerID

                    layerFound = layer

        return layerFound

    module.removeLayer = (layerData) ->

        layerIndex = $.inArray layerData, layers

        if layer.selected

            module.setLayerActive false

        layers.splice layerIndex, 1

        $.publish "layerRemove", [layerData.id]

        layer = null

    module.removeLayerByID = (layerID) ->

        layer = module.getLayerById layerID

        if layer

            module.removeLayer layer

        layer = null

    return module