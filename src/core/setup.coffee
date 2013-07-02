# @module setup
# @author mbaijs
#
define [
    # App core modules.
    #
    "cs!config"
,   "cs!cache"
,   "cs!util/misc"

    # Libraries
    #
,   "plugins/jquery.pubsub"
,   "plugins/jquery.hammer"

], (config, cache, utilMisc) ->

    $       = jQuery
    ui      = null
    engines = null

    loadEngine = (event, engineName, callback) ->

        require ["cs!engine/" + engineName], (engine) ->

            # Fire up the engine.
            #
            engine.initialize()

            callback and callback engine

    $(document).ready ->

        # Initialize config and make some shorthand s.
        #
        config.initialize()

        ui      = config.options.ui
        engines = config.options.engines

        # Setup (touch) events and gestures.
        #
        $(document).hammer
            scale_treshold    : 0
            drag_min_distance : 0

        # Initialize the user interface.
        #
        utilMisc.loadModules ui, "cs!ui/", (modules) ->

            for moduleName of ui

                if modules[moduleName]

                    modules[moduleName].initialize()

        # Start render engine.
        #
        for engineName in engines.order

            if engines.types[engineName].support

                loadEngine false, engineName, (engine) ->

                    # Since the engine is now running. We can fetch and initialize our cache.
                    #
                    cache.initialize()

                return false

        # Listen for global app events.
        #
        $.subscribe "loadEngine", loadEngine