/**
 * @description <p>A toolbar module that keeps track of all the layers.</p>
 *
 * @namespace imageCreator.toolbar
 * @name layers
 * @version 1.0
 * @author mbaijs
 */
define(
[
    // Module HTML template
    //
    "text!templates/layers.html"

    // App core modules
    //
,   "config"

    // jQuery plugins
    //
,   "plugins/jquery.tabular"
],
function( moduleHTML, config )
{
    var module =
        {
            name     : "layers"
        ,   enabled  : false
        ,   options  : {}
        ,   snippets : {}
        }

    ,   $imageCreatorViewport 
    ,   $module
    ,   $moduleTitle
    ,   $layerContainer

    // The curent layer that is being edited.
    //
    ,   $currentLayer = false
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
        module.options = config.options.toolbar.layers;

        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //       
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module               = $( ".imageCreatorToolLayers" );
        $moduleTitle          = $module.find( ".moduleTitle" );
        $layerContainer       = $module.find( ".layerContainer" );
        $selectRenderEngine   = $module.find( ".selectRenderEngine" );
        $inputConstrainLayers = $module.find( ".inputConstrainLayers" );
        $buttonImageSave      = $( ".buttonImageSave" );

        // Set module title.
        //
        $moduleTitle.text( module.options.title );

        // Initialize module UI.
        //
        if( module.options.showMenu )
        {
            $module.tabular(
            {
                "menu"  : ".moduleMenu"
            ,   "tabs"  : "a"
            ,   "pages" : ".moduleBody" 
            });
        }
        else
        {
            $module.find( ".moduleMenu" ).remove();
        }

        // Get snippets.
        //
        module.snippets.$objectLayerSnippet = $module.find( ".objectLayer" ).remove();
        module.snippets.$engineSnippet      = $module.find( ".selectRenderEngineItem" ).remove();

        // Set inputs to match module options.
        //
        $inputConstrainLayers.attr( "checked", module.options.constrainLayers );
        $.each( config.options.engines, function( engineName, engine )
        {
            if( engine.support() )
            {
                var $engineClone = module.snippets.$engineSnippet.clone();
                
                $engineClone.attr( "value", engineName );
                $engineClone.text( engineName );
                $engineClone.attr( "selected", engineName === config.engine.name );
                $engineClone.data( "engine", engineName );

                $selectRenderEngine.append( $engineClone );
            }
        }); 

        // Listen to global app events.
        //
        $imageCreatorViewport.bind( "layerUpdate", layerUpdate );

        // Set Button events.
        //  
        $layerContainer.delegate( ".objectLayer",  "click", layerSelect );
        $layerContainer.delegate( ".objectToggle", "click", layerToggle );
        $layerContainer.delegate( ".objectRemove", "click", layerRemove );
        $selectRenderEngine.change( optionRenderEngineSelect );
        $inputConstrainLayers.change( optionConstrainLayersToggle );
        $( "body" ).delegate( ".buttonImageSave", "click", function(){ alert("Saving!!!"); });        
    };

    module.getAllLayers = function()
    {
        var layers           = []
        ,   currentLayerData = $currentLayer && $currentLayer.data( "layer" )
        ;

        $layerContainer.find( ".objectLayer" ).each( function( index, layer )
        {
            layers.unshift( $( layer ).data( "layer" ) );
        });

        return { active : currentLayerData, layers : layers };
    };

    module.getCurrentLayer = function()
    {
        return $layerContainer.find( ".active" ).data( "layer" );
    };

    function layerSelect()
    {
        var $oldLayer    = $layerContainer.find( ".active" )
        ,   $newLayer    = $( this )
        ,   oldLayerData = $oldLayer.data( "layer" )
        ,   newLayerData = $newLayer.data( "layer" )
        ;

        // Unselect the currently selected layer.
        // 
        if( $oldLayer.length > 0 )
        {
            $oldLayer.removeClass( "active" );

            oldLayerData.selected = false;
            $oldLayer.data( "layer", oldLayerData );
        }

        // Select the new layer.
        //
        $newLayer.addClass( "active" );
        $currentLayer = $newLayer;

        newLayerData.selected = true;

        // Tell the app what layer is now selected.
        //
        $imageCreatorViewport.trigger( "layerSelect", [ newLayerData ] );

        return false;
    }

    function layerUpdate( event, objectLayer )
    {
        $currentLayer = $layerContainer.find( "#objectLayer" + objectLayer.id );
        
        var $layerClone = null;

        // This is a new layer. Create and select it.
        //
        if( 0 === $currentLayer.length )
        {
            $layerClone = module.snippets.$objectLayerSnippet.clone();
            $layerClone.attr( "id", "objectLayer" + objectLayer.id );
            $layerClone.data( "layer", objectLayer );

            if( objectLayer.image )
            {
                $layerClone.find( ".objectLayerName" ).text( objectLayer.name );
                $layerClone.find( "img" ).attr( "src", objectLayer.image.src );
            }

            if( objectLayer.text )
            {
                $layerClone.find( ".objectLayerName" ).text( objectLayer.text );
                //$layerClone.find( "img" ).attr( "src", objectLayer.image.src );   
            }
            $layerContainer.prepend( $layerClone );

            layerSelect.call( $layerClone[0] );
        }
        // Update layer
        //
        else
        {
            if( objectLayer.text )
            {
                $currentLayer.find( ".objectLayerName" ).text( objectLayer.text.replace( "<br/>", "" ) );
            } 

            $currentLayer.data( "layer", objectLayer );
        }
    }

    function layerToggle( event )
    {
        var $layerToToggle    = $( this ).parent()
        ,   layerToToggleData = $layerToToggle.data( "layer" )
        ;

        $layerToToggle.toggleClass( "hide" );

        layerToToggleData.visible = ! $layerToToggle.hasClass( "hide" );
        
        $layerToToggle.data( "layer", layerToToggleData );

        $imageCreatorViewport.trigger( "layerVisibility", [ layerToToggleData ] );

        return false;
    }

    function layerRemove( event )
    {
        var $layerToRemove    = $( this ).parent()
        ,   layerToRemoveData = $layerToRemove.data( "layer" )
        ;

        // Remove layer from layers list.
        //            
        $layerToRemove.remove();

        // Tell the app to remove this layer.
        //
        $imageCreatorViewport.trigger( "layerRemove", [ layerToRemoveData ] );

        // If this layer is the current selected one. Deselect it.
        //
        if( layerToRemoveData.selected )
        {
            $currentLayer = false;
            $imageCreatorViewport.trigger( "layerSelect", [ false ] );
        }

        return false;
    }

    function optionRenderEngineSelect( event )
    {
        $imageCreatorViewport.trigger( "loadEngine", [ $( this ).find( ":selected" ).data( "engine" ) ] );
    }

    function optionConstrainLayersToggle( event )
    {
        config.setOptions(
        { 
            toolbar : 
            {
                layers : 
                {
                    constrainLayers : $inputConstrainLayers.is( ":checked" )
                }
            }
        });
    }

    return module;
} );