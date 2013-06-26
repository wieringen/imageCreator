# @module balloon
#
define [

    # App core modules.
    #
    "config"
,   "cs!util/math"
,   "cs!util/misc"
,   "cs!model/layer"

], ( config, utilMath, utilMisc, modelLayer ) ->

    module =

        options : config.options.models.balloon

    # @class Balloon
    # @extends Layer
    # @constructor
    #
    class Balloon extends modelLayer

    # @method fromObject
    # @static
    #
    Balloon.fromObject = ( object, callback ) ->

    return Balloon
