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
    // Module HTML template.
    //
    "text!templates/text.html"

    // App core modules.
    //
,   "config"
,   "utils"

    // jQuery plugins.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
,   "plugins/jquery.circleSlider"
,   "plugins/jquery.colorPicker"
],
function( moduleHTML, config, utils )
{
    var module =
        {
            name     : "text"
        ,   enabled  : true
        ,   options  : {}
        ,   snippets : {}
        }

    ,   $imageCreatorViewport
    ,   $module
    ,   $moduleTitle
    ,   $imageCreatorSelection  
    ,   $textSize
    ,   $textRotate
    ,   $buttonTextAdd
    ,   $buttonTextWeight
    ,   $buttonTextStyle
    ,   $selectTextFont
    ,   $areaTextEdit

    // The default properties of a text layer.
    //
    ,   layerDefault = 
        {
            id              : null
        ,   type            : "text"
        ,   visible         : true

        // text layer specific properties.
        //
        ,   text            : "Your text here..."
        ,   color           : "#000000"
        ,   fontSize        : 14
        ,   font            : "Arial"
        ,   weight          : false
        ,   style           : false

        // Unrotated position and size.
        //
        ,   sizeCurrent     : { "width": 0, "height": 0 }
        ,   position        : { "x": 0, "y": 0 } 

        // Rotated position and size.
        //
        ,   sizeRotated     : { "width": 0, "height": 0 }
        ,   positionRotated : { "x": 0, "y": 0 } 

        // Difference between unrotated and rotated size.
        //
        ,   offset          : { "x": 0, "y": 0 }

        // Matrix calculations.
        //
        ,   scale           : 1
        ,   rotation        : { degrees: 0, radians : 0, sin: 0, cos: 1 }
        ,   matrix          : [ 1, 0, 0, 1, 0, 0 ]
        }

    // The curent layer that is being edited.
    //
    ,   layerCurrent = false
    ;


    /**
      * @description Function that initializes the module. It will append the modules html, set the title and initializes its UI.
      *
      * @name module#initialize
      * @function
      *
      */
    module.initialize = function()
    {
        // Easy reference config options.
        //
        module.options = config.options.toolbar.text;

        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //
        $imageCreatorViewport  = $( ".imageCreatorViewport" );
        $imageCreatorSelection = $( ".imageCreatorSelection" );

        // Get module DOM elements.
        //        
        $module           = $( ".imageCreatorToolText" );
        $moduleTitle      = $module.find( ".moduleTitle" );
        $textSize         = $module.find( ".textSize" );
        $textColor        = $module.find( ".textColor" );
        $textRotate       = $module.find( ".textRotate" );
        $buttonTextAdd    = $( ".imageCreatorTextAdd" );
        $buttonTextWeight = $module.find( ".buttonTextWeight" );
        $buttonTextStyle  = $module.find( ".buttonTextStyle" ); 
        $areaTextEdit     = $module.find( ".areaTextEdit" );
        $selectTextFont   = $module.find( ".selectTextFont" ); 

        // Set module title.
        //
        $moduleTitle.text( module.options.title );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleBody"
        }); 
        $textSize.slider( 
        { 
            "start" : 14
        ,   "scale" : module.options.textSizeScale
        ,   "unit"  : "px"
        });
        $textRotate.circleSlider();
        $textColor.colorPicker();

        // Listen to global app events.
        //
        $imageCreatorViewport.bind( "viewportMove", textPosition );
        $imageCreatorViewport.bind( "layerSelect", textSelect );
        $imageCreatorViewport.bind( "layerVisibility", textSelect );
        $imageCreatorViewport.bind( "layerResize", textResize );

        // Listen to selection events.
        //        
        $imageCreatorSelection.bind( "onRotate", textRotate );
        $imageCreatorSelection.bind( "onResize", textResize );

        // Listen to UI module events.
        //           
        $textSize.bind( "onDrag", textSize );
        $textRotate.bind( "onDrag", textRotate );
        $textColor.bind( "colorUpdate", textColor );

        // Set module input / button events.
        //             
        $buttonTextAdd.click( textAdd );
        $buttonTextWeight.click( textWeight );
        $buttonTextStyle.click( textStyle );
        $areaTextEdit.bind( "change, keyup", textEdit );
        $selectTextFont.change( textFont );
    };

    /**
      * @description Function that select a certain text layer and sets or disables the modules UI.
      *
      * @name textSelect
      * @function
      *
      */
    function textSelect( event, layer )
    {
        // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
        //
        if( event.type === "layerVisibility" && ! layer.selected )
        {
            return false;
        }

        // Enable module if layer is of the correct type and is visible.
        //
        module.enabled = layer.visible && layer.type === "text" || false;
        $module.toggleClass( "moduleDisabled", ! module.enabled ); 

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $textRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            $textSize.trigger( "setPosition", [ layerCurrent.fontSize ] );
            $textColor.trigger( "setColor", [ layerCurrent.color ] );
            $buttonTextWeight.toggleClass( "active", layerCurrent.weight ); 
            $buttonTextStyle.toggleClass( "active", layerCurrent.style ); 
            $areaTextEdit.val( layerCurrent.text );
        }
    }

    /**
      * @description Function that is called when selection resize events are triggerd.
      *
      * @name textResize
      * @function
      *
      */
    function textResize( event, delta, direction )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.sizeRotated.width  = Math.max( 20, layerCurrent.sizeRotated.width  - delta.x );
            layerCurrent.sizeRotated.height = Math.max( 20, layerCurrent.sizeRotated.height - delta.y );
            
            layerCurrent.sizeCurrent = utils.getRectSizeInsideBoundingBox( layerCurrent.sizeRotated, layerCurrent.rotation );
            
            layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2  );
            layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            textPosition( false, { x : ( direction.compensate[0] ? delta.x : 0 ), y: ( direction.compensate[1] ? delta.y : 0 ) }, true );

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    /**
      * @description Function that creates a new text layer with default properties.
      *
      * @name textAdd
      * @function
      *
      */
    function textAdd( event )
    {
        // Since we are adding a new text we can enable the module savely.
        //
        module.enabled = true;        

        // Clone and set layer defaults.
        // 
        layerCurrent = $.extend( true, {}, layerDefault );

        // Set layer options.
        //       
        layerCurrent.id        = "text" + new Date().getTime().toString();
        layerCurrent.layerName = layerCurrent.text;
        layerCurrent.font      = module.options.font;

        layerCurrent.sizeCurrent.width  = module.options.textWidth;
        layerCurrent.sizeCurrent.height = module.options.textHeight;

        layerCurrent.sizeRotated = layerCurrent.sizeCurrent;

        // Set the layer's position to the center of the viewport. 
        //   
        var position = 
        {
            x : ( config.options.viewportWidth / 2 ) - ( layerCurrent.sizeCurrent.width / 2 )
        ,   y : ( config.options.viewportHeight / 2 ) - ( layerCurrent.sizeCurrent.height / 2)
        };

        textPosition( false, position, true );

        $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );

        return false;
    }

    /**
      * @description Function that sets the text of a text layer.
      *
      * @name textEdit
      * @function
      *
      */
    function textEdit( event )
    {       
        if( module.enabled && layerCurrent && layerCurrent.visible )
        { 
            layerCurrent.text = this.value.replace(/\n/g, "<br/>");

            textSize( false, layerCurrent.fontSize );
        }
    }

    /**
      * @description Function that sets the font size and height of a layer.
      *
      * @name textSize
      * @function
      *
      */
    function textSize( event, fontSize )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.fontSize = fontSize;

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
            
            // Ieeuw there is no way to calculate the height so i need to get it from the dom :(
            //
            var $textLayer = $( "#" + layerCurrent.id + config.engine.name );

            if( $textLayer[0].nodeName !== "P" )
            {
                $textLayer = $textLayer.find( "p" );  
            }

            layerCurrent.sizeCurrent.height = $textLayer.height();
            
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );
            
            layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + ( layerCurrent.sizeRotated.width  - layerCurrent.sizeCurrent.width ) / 2  );
            layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.matrix = utils.getMatrix( layerCurrent.rotation, 1, layerCurrent.position, layerCurrent.sizeCurrent );

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    /**
      * @description Function that sets a text layer's font.
      *
      * @name textFont
      * @function
      *
      */
    function textFont( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.font = $( this ).val();

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    /**
      * @description Function that sets a text layer's font color.
      *
      * @name textColor
      * @function
      *
      */
    function textColor( event, hexColor )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.color = hexColor;

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    /**
      * @description Function that toggle a text layer's font weight.
      *
      * @name textWeight
      * @function
      *
      */
    function textWeight( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.weight = ! layerCurrent.weight;

            $buttonTextWeight.toggleClass( "active", layerCurrent.weight ); 

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    /**
      * @description Function that toggle a text layer's font style.
      *
      * @name textStyle
      * @function
      *
      */
    function textStyle( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.style = ! layerCurrent.style;

            $buttonTextStyle.toggleClass( "active", layerCurrent.style ); 

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] ); 
        }
    }

    /**
      * @description Function that rotates a text to certain number of degrees.
      *
      * @name textRotate
      * @function
      *
      */   
    function textRotate( event, rotation )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            if( "onRotate" === event.type )
            {
                $textRotate.trigger( "setPosition", [ layerCurrent.rotation.degrees ] );
            }            

            layerCurrent.rotation    = rotation;
            layerCurrent.sizeRotated = utils.getBoundingBox( layerCurrent.sizeCurrent, layerCurrent.rotation );

            textPosition( false, { x: 0, y: 0 }, true );

            $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
        }
    }

    /**
      * @description Function that sets a text layers position.
      *
      * @name textPosition
      * @function
      *
      */   
    function textPosition( event, delta, internal )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.position.x = Math.round( layerCurrent.position.x + delta.x );
            layerCurrent.position.y = Math.round( layerCurrent.position.y + delta.y );

            layerCurrent.offset.x = Math.round( ( layerCurrent.sizeRotated.width - layerCurrent.sizeCurrent.width ) / 2 );
            layerCurrent.offset.y = Math.round( ( layerCurrent.sizeRotated.height - layerCurrent.sizeCurrent.height ) / 2 );

            layerCurrent.positionRotated.x = layerCurrent.position.x - layerCurrent.offset.x;
            layerCurrent.positionRotated.y = layerCurrent.position.y - layerCurrent.offset.y;

            textConstrain();

            layerCurrent.matrix = utils.getMatrix( layerCurrent.rotation, 1, layerCurrent.position, layerCurrent.sizeCurrent );

            if( ! internal )
            {
                $imageCreatorViewport.trigger( "layerUpdate", [ layerCurrent ] );
            }
        }
    }

    /**
      * @description Function that constrains a text layer to the viewport edges.
      *
      * @name textConstrain
      * @function
      *
      */   
    function textConstrain()
    {
        if( config.options.toolbar.layers && ! config.options.toolbar.layers.constrainLayers )
        {
            return false;
        }
        
        var ratio = { 
            width  : config.options.viewportWidth - layerCurrent.sizeRotated.width
        ,   height : config.options.viewportHeight - layerCurrent.sizeRotated.height
        };

        if(layerCurrent.positionRotated.x <= 0 + ( ratio.width < 0 ? ratio.width : 0) )
        { 
            layerCurrent.positionRotated.x = Math.round( ratio.width < 0 ? ratio.width : 0 );
        }

        if(layerCurrent.positionRotated.y <= 0 + ( ratio.height < 0 ? ratio.height : 0) )
        { 
            layerCurrent.positionRotated.y = Math.round( ratio.height < 0 ? ratio.height : 0 );
        }

        if(layerCurrent.positionRotated.x + ( ratio.width < 0 ? ratio.width : 0) >= ratio.width )
        { 
            layerCurrent.positionRotated.x = Math.round( ratio.width < 0 ? 0 : ratio.width );
        }

        if(layerCurrent.positionRotated.y + ( ratio.height < 0 ? ratio.height : 0) >= ratio.height )
        { 
            layerCurrent.positionRotated.y = Math.round( ratio.height < 0 ? 0 : ratio.height );
        }

        layerCurrent.position.x = Math.round( layerCurrent.positionRotated.x + layerCurrent.offset.x );
        layerCurrent.position.y = Math.round( layerCurrent.positionRotated.y + layerCurrent.offset.y );
    }
   
    return module;
} );
