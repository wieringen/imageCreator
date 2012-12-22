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
    "jquery"

    // Module HTML template
    //
,   "text!toolbar/layers/layers.html"

    // App core modules
    //

    // jQuery plugins
    //
,   "plugins/jquery.tabular"
],
function( $, moduleHTML )
{
    var theApp = window[ "imageCreator" ]
    ,   module =
        {
            name     : "layers"
        ,   target   : ".toolbarLayers"
        ,   enabled  : false
        ,   settings : 
            {
                constrainLayers : true
            }
        ,   snippets : {}
        }

    ,   $imageCreator 
    ,   $module
    ,   $objectLayers
    ,   $buttonLayerRemove

    // The curent layer that is being edited.
    //
    ,   $currentLayer = false
    ;

    module.initialize = function( options )
    {        
        // Append module HTML.
        //
        $( module.target ).replaceWith( moduleHTML );

        // Get basic app DOM elements.
        //       
        $imageCreator      = $( ".imageCreator" );

        // Get module DOM elements.
        //
        $module               = $( ".toolbarLayers" );
        $objectLayers         = $module.find( ".objectLayers" );
        $buttonLayerRemove    = $module.find( ".buttonLayerRemove" );
        $selectRenderEngine   = $module.find( ".selectRenderEngine" );
        $inputConstrainLayers = $module.find( ".inputConstrainLayers" );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleBody" 
        });

        // Get snippets.
        //
        module.snippets.$objectLayerSnippet = $module.find( ".objectLayer" ).remove();
        module.snippets.$engineSnippet      = $module.find( ".selectRenderEngineItem" ).remove();

        // Set options.
        //
        $inputConstrainLayers.attr( "checked", module.settings.constrainLayers );
        $.each( theApp.settings.engine, function( index, engine )
        {
            if( engine.support() )
            {
                var $engineClone = module.snippets.$engineSnippet.clone();
                
                $engineClone.attr( "value", engine.name );
                $engineClone.text( engine.name );
                $engineClone.attr( "selected", engine.name === theApp.engine.name );
                $engineClone.data( "engine", engine );

                $selectRenderEngine.append( $engineClone );
            }
        }); 

        // Listen to global app events.
        //
        $imageCreator.bind( "layerUpdate", layerUpdate );

        // Set Button events.
        //  
        $objectLayers.delegate( ".objectLayer", "click", layerSelect );
        $objectLayers.delegate( ".objectToggle", "click", layerToggle );
        $buttonLayerRemove.click( layerRemove );
        $selectRenderEngine.change( optionRenderEngineSelect );
        $inputConstrainLayers.change( optionConstrainLayersToggle );
    };

    module.getAllLayers = function()
    {
        var layers           = []
        ,   currentLayerData = $currentLayer && $currentLayer.data( "layer" );
        ;

        $objectLayers.find( ".objectLayer" ).each( function( index, layer )
        {
            layers.unshift( $( layer ).data( "layer" ) );
        });

        return { active : currentLayerData, layers : layers };
    };

    module.getCurrentLayer = function()
    {
        return $objectLayers.find( ".active" ).data( "layer" );
    };

    function layerSelect()
    {
        var $oldLayer    = $objectLayers.find( ".active" )
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

        // Activate UI controls
        //
        $buttonLayerRemove.removeClass( "disabled" );

        // Tell the app what layer is now selected.
        //
        $imageCreator.trigger( "layerSelect", [ newLayerData ] );

        return false;
    }

    function layerUpdate( event, objectLayer )
    {
        $currentLayer = $objectLayers.find( "#objectLayer" + objectLayer.id );
        
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

            $objectLayers.prepend( $layerClone );

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

        $imageCreator.trigger( "layerVisibility", [ layerToToggleData ] );

        return false;
    }

    function layerRemove( event )
    {
        if( $currentLayer )
        {
            var currentLayerData = $currentLayer.data( "layer" );
            
            // Remove layer from layers list and out of module memory.
            //            
            $currentLayer.remove();
            $currentLayer = false;

            // Tell the app to remove this layer and unselect it.
            //
            $imageCreator.trigger( "layerRemove", [ currentLayerData ] );
            $imageCreator.trigger( "layerSelect", [ false ] );

            // Disable UI.
            //
            $buttonLayerRemove.addClass( "disabled" );
        }

        return false;
    }

    function optionRenderEngineSelect( event )
    {
        $imageCreator.trigger( "loadEngine", [ $( this ).find( ":selected" ).data( "engine" ) ] );
    }

    function optionConstrainLayersToggle( event )
    {
         module.settings.constrainLayers = $inputConstrainLayers.attr( "checked" );
    }

    return module;
} );