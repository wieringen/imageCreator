/**
 * Image tool Class
 *
 * @name Image
 * @class Image
 * @constructor
 *
 */
define(
[
    // App core modules.
    //
    "config"
,   "util.math"
,   "util.class"
,   "model.layer"
],
function( config, utilMath, utilClass, modelLayer )
{
    var module =
    {
        options : config.options.models.image
    };

    module.model = utilClass.createClass( modelLayer,
    {
        type      : "image"
    ,   sizeReal :
        {
            width  : 0
        ,   height : 0
        }

    ,   filter :
        {
            name     : "none"
        ,   matrix   : false
        ,   strength : 1
        }

    ,   initialize : function( element, options )
        {
            options || ( options = { } );

            this.callSuper("initialize", options);

            this.image = element;
            this.name  = this.src.substring( this.src.lastIndexOf("/") + 1 );

            this.set( "sizeReal",
            {
                width  : this.image.width
            ,   height : this.image.height
            });

            this.id = options.id || "image" + new Date().getTime().toString();

            if( ! options.sizeCurrent )
            {
                this.set( "sizeCurrent",
                {
                    width  : this.sizeReal.width
                ,   height : this.sizeReal.height
                });
            }

            this._initConfig(options);

            this.setScale();
        }

    ,   _initConfig: function(options)
        {
            options || (options = { });

            this.setOptions(options);
        }

    ,   toObject: function( propertiesToInclude )
        {
            return $.extend( this.callSuper( "toObject", propertiesToInclude ),
            {
                src       : this.src
            ,   type      : this.type
            ,   imageType : this.imageType
            ,   sizeReal  : this.sizeReal
            ,   filter    : this.filter
            });
        }

    ,   setScale : function( scale )
        {
            this.scale = Math.max( 0.1, Math.min( 1, scale || this.scale ) );

            var sizeNew =
                {
                    width  : Math.round( this.scale * this.sizeReal.width )
                ,   height : Math.round( this.scale * this.sizeReal.height )
                }
            ,   newPosition =
                {
                    x : ( this.sizeCurrent.width  - sizeNew.width  ) / 2
                ,   y : ( this.sizeCurrent.height - sizeNew.height ) / 2
                }
            ;

            this.sizeCurrent = sizeNew;
            this.sizeRotated = utilMath.getBoundingBox( this.sizeCurrent, this.rotation );

            this.setPosition( newPosition );
        }

    ,   setFilter: function( filter )
        {
            this.filter = filter || {
                name     : "none"
            ,   matrix   : false
            ,   strength : 1
            };
        }

    ,   setFilterStrength: function( strength )
        {
            this.filter.strength = strength / 100;
        }
    });

    module.model.fromObject = function( object, callback )
    {
        var deferred = $.Deferred()
        ,   img      = document.createElement( "img" )
        ;

        img.onload = function()
        {
            var model = new module.model( img, object );

            deferred.resolve( model );

            if (callback)
            {
                callback( model );
            }

            img = img.onload = img.onerror = null;
        };

        img.onerror = function()
        {
            deferred.resolve();

            img = img.onload = img.onerror = null;
        };

        img.src = object.src;

        return deferred.promise();
    };

    return module.model;
} );