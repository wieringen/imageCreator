/**
 * @description A html5 image upload plugin.
 *
 * @name imageUpload
 * @version 1.0
 * @author mbaijs
 */
define(
[
    "jquery"
],
function( $ )
{
    var pluginName = "dropArea"
    ,   defaults   =
        { 
    
        }
    ;

    function Plugin( element, options )
    {
        this.element   = element;
        this.options   = $.extend( {}, defaults, options );
        this._defaults = defaults;
        this._name     = pluginName;

        this.init();
    }

    Plugin.prototype = 
    {   
        $dropArea : null,

        init: function()
        {
            var testFileApi = !!window.FileReader;

            if( ! testFileApi )
            {
                return false;
            };

            this.createDropArea();
            this.setEvents();
        }, 
 
        createDropArea: function()
        {
            var _self = this;
            
            this.$dropArea = $( "<div class='dropArea'></div>")
            this.$dropArea.text( "Drop your image here" );

            $( _self.element ).append( this.$dropArea );
        },

        setEvents: function()
        {
            var _self = this;

            document.ondragover = function()
            { 
                _self.$dropArea.show();
                return false; 
            };
            
            document.ondragend = function()
            {
                _self.$dropArea.hide();                
                return false; 
            };
            
            this.element.ondrop = function (e)
            {
                e.preventDefault();

                var files = e.dataTransfer.files;

                _self.$dropArea.hide(); 
                
                if( files.length > 0 )
                {
                    var file = files[0];

                    if( typeof FileReader !== "undefined" && file.type.indexOf("image") != -1 ) 
                    {
                        var reader = new FileReader();
                        
                        reader.onload = function(event) 
                        {
                            $( _self.element ).trigger( "fileUpload", [ event.target.result ] );
                        };

                        reader.readAsDataURL( file );
                    }
                }
            };
        },

        uploadFile : function( evt ) 
        {
            var _self = this
            ,  files  = evt.dataTransfer.files;

            if ( files.length > 0 )
             {
                var file = files[0];

                if ( typeof FileReader !== "undefined" && file.type.indexOf("image") != -1 ) 
                {
                    var reader = new FileReader();

                    reader.onload = function(event) 
                    {
                        $( _self.element ).trigger( "fileUpload", [ event ] );
                    };

                    reader.readAsDataURL(file);
                }
            }
            return false;
        }
    };

    $.fn[ pluginName ] = function( options )
    {
        return this.each(function ()
        {
            var dataPlugin = $.data( this, 'plugin_' + pluginName );

            if( ! dataPlugin )
            {
                $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
            }
        });
    }
});