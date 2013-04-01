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
,   "util.misc"
],
function( config, utilMath, utilClass, utilMisc )
{
    var module = 
    {
        options : {}
    };

    module.model = utilClass.createClass(
    {
        id              : null
    ,   name            : ""
    ,   type            : ""
    
    ,   visible         : true
    ,   locked          : false
    ,   selected        : false

    // Unrotated position and size.
    //
    ,   sizeCurrent     : { width: 0, height: 0 }
    ,   position        : { x: 0, y: 0 } 

    // Rotated position and size.
    //
    ,   sizeRotated     : { width: 0, height: 0 }
    ,   positionRotated : { x: 0, y: 0 } 

    // Difference between unrotated and rotated size.
    //
    ,   offset          : { x: 0, y: 0 }

    // Projection matrix.
    //
    ,   scale           : 1
    ,   rotation        : { degrees: 0, radians : 0, sin: 0, cos: 1 }
    ,   matrix          : [ 1, 0, 0, 0, 1, 0 ]

    ,   initialize: function(options)
        {
            if (options)
            {
                this.setOptions( options );
            }
        }

    ,   setOptions: function(options) 
        {
            for (var prop in options) 
            {
                this.set(prop, options[prop]);
            }
        }

    ,   toObject: function(propertiesToInclude)
        {
            var object = 
            {
                id              : this.id
            ,   name            : this.name

            ,   visible         : this.visible
            ,   locked          : this.locked
            ,   selected        : this.selected

            ,   sizeCurrent     : this.sizeCurrent
            ,   position        : this.position

            ,   sizeRotated     : this.sizeRotated
            ,   positionRotated : this.positionRotated

            ,   offset          : this.offset

            ,   scale           : this.scale
            ,   rotation        : this.rotation
            ,   matrix          : this.matrix  
            };

            utilMisc.populateWithProperties(this, object, propertiesToInclude);

            return object;
        }

    ,   get: function(property) 
        {
            return this[property];
        }

    ,   _set: function(key, value) 
        {
            this[key] = value;

            return this;
        }

    ,   set: function(key, value) 
        {
            if (typeof key === 'object') 
            {
                for (var prop in key) 
                {
                    this._set(prop, key[prop]);
                }
            }
            else 
            {
                if (typeof value === 'function') 
                {
                    this._set(key, value(this.get(key)));
                }
                else 
                {
                    this._set(key, value);
                }
            }

            return this;
        }

    ,   setRotate: function( rotation )
        {
            this.set( "rotation", rotation );
            this.set( "sizeRotated", utilMath.getBoundingBox( this.sizeCurrent, this.rotation ) );

            this.setPosition( { x: 0, y: 0 } );
        }

    ,   setPosition: function( delta )
        {
            this.set( "position", 
            {
                x : this.position.x + delta.x
            ,   y : this.position.y + delta.y
            });

            this.set( "offset", 
            {
                x : ( this.sizeRotated.width  - this.sizeCurrent.width )  / 2
            ,   y : ( this.sizeRotated.height - this.sizeCurrent.height ) / 2
            });

            this.set( "positionRotated", 
            {
                x : this.position.x - this.offset.x
            ,   y : this.position.y - this.offset.y
            });

            this.setPositionConstrain({
                width  : config.options.viewport.width
            ,   height : config.options.viewport.height
            });

            this.matrix = utilMath.getMatrix( this.rotation, this.scale, this.position, this.sizeReal || this.sizeCurrent );
        }

    ,   setPositionConstrain: function( grid )
        {
            var ratio = 
            { 
                width  : grid.width  - this.sizeRotated.width
            ,   height : grid.height - this.sizeRotated.height
            };

            if( this.positionRotated.x <= 0 + ( ratio.width < 0 ? ratio.width : 0) )
            { 
                this.positionRotated.x = ratio.width < 0 ? ratio.width : 0;
            }

            if( this.positionRotated.y <= 0 + ( ratio.height < 0 ? ratio.height : 0) )
            { 
                this.positionRotated.y = ratio.height < 0 ? ratio.height : 0;
            }

            if( this.positionRotated.x + ( ratio.width < 0 ? ratio.width : 0) >= ratio.width )
            { 
                this.positionRotated.x = ratio.width < 0 ? 0 : ratio.width;
            }

            if( this.positionRotated.y + ( ratio.height < 0 ? ratio.height : 0) >= ratio.height )
            { 
                this.positionRotated.y = ratio.height < 0 ? 0 : ratio.height;
            }

            this.set( "position", 
            {
                x : this.positionRotated.x + this.offset.x
            ,   y : this.positionRotated.y + this.offset.y
            });
        }
    });

    return module.model;
} );