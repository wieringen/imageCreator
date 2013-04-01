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
    ,   textLongestLine : ""
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

    ,   toObject: function() 
        {
            return this.callSuper( "toObject",
            {
                type            : this.type
            ,   text            : this.text
            ,   textLines       : this.textLines
            ,   textLongestLine : this.textLongestLine
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
            this.textLines       = this.text.replace(/\r\n/g, "\n").split("\n");
            this.textLongestLine = "";

            for( var lineIndex = this.textLines.length; lineIndex--; )
            { 
                if( this.textLines[lineIndex].length > this.textLongestLine.length )
                {
                    this.textLongestLine = this.textLines[lineIndex];
                }
            }
        }

    ,   setFontSize: function( fontSize )
        {
            this.fontSize = fontSize || this.fontSize;

            var sizeNew = 
                {
                    width  : utilMisc.measureText( this )
                ,   height : this.textLines.length * Math.floor( this.fontSize * this.lineHeight )
                }
            ,   newPosition =
                {
                    x : ( this.sizeCurrent.width - sizeNew.width ) / 2
                ,   y : 0
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

    return module.model;  
} );
