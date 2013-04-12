 /**
 * @description <p></p>
 *
 * @namespace imageCreator.toolbar
 * @name text
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "config"
,   "util.math"
,   "util.class"
,   "util.misc"
,   "model.layer"
],
function( config, utilMath, utilClass, utilMisc, modelLayer )
{
    var module =
    {
        options : config.options.layers.text
    };

    module.model = utilClass.createClass( modelLayer,
    {
        type            : "text"
    ,   text            : ""
    ,   textLines       : []
    ,   color           : "#000000"
    ,   fontSize        : module.options.fontSize
    ,   lineHeight      : module.options.lineHeight
    ,   font            : module.options.font
    ,   weight          : false
    ,   style           : false
    ,   editable        : true

    ,   initialize : function( options )
        {
            options || ( options = { } );

            this.callSuper( "initialize", options);

            this.id        = options.id || "text" + new Date().getTime().toString();
            this.layerName = this.text;

            this._initConfig(options);

            this.setLines();
            this.setFontSize();
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
                type            : this.type
            ,   text            : this.text
            ,   textLines       : this.textLines
            ,   color           : this.color
            ,   fontSize        : this.fontSize
            ,   lineHeight      : this.lineHeight
            ,   font            : this.font
            ,   weight          : this.weight
            ,   style           : this.style
            });
        }

    ,   setText: function( text )
        {
            this.text = text;

            this.setLines();
            this.setFontSize();
        }

    ,   setLines: function()
        {
            this.textLines = this.text.replace(/\r\n/g, "\n").split("\n");
        }

    ,   setScale : function( scale )
        {
            this.setFontSize( scale );
        }

    ,   setFontSize: function( fontSize )
        {
            this.fontSize = Math.max( 10, Math.min( 99, fontSize || this.fontSize ) );

            var sizeNew =
                {
                    width  : utilMisc.measureText( this )
                ,   height : this.textLines.length * Math.floor( this.fontSize * this.lineHeight )
                }
            ,   newPosition =
                {
                    x : ( this.sizeCurrent.width - sizeNew.width ) / 2
                ,   y : ( this.sizeCurrent.height - sizeNew.height ) / 2
                }
            ;

            this.sizeCurrent = sizeNew;
            this.sizeRotated = utilMath.getBoundingBox( this.sizeCurrent, this.rotation );

            this.setPosition( newPosition );
        }

    ,   setFont: function( font )
        {
            this.font = font;

            this.setFontSize();
        }

    ,   setColor: function( hexColor )
        {
            this.color = hexColor;
        }

    ,   setWeight: function( weight )
        {
            this.weight = weight;

            this.setFontSize();
        }

    ,   setStyle: function( style )
        {
            this.style = style;
        }
    });

    module.model.fromObject = function( object, callback )
    {
        var deferred = $.Deferred()
        ,   model    = new module.model( object );
        ;

        deferred.resolve( model );

        if( callback )
        {
            callback( model );
        }

        return deferred.promise();
    };


    return module.model;
} );
