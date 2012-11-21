/**
 * @description <p>A toolbar module that keeps track of all the layers.</p>
 *
 * @namespace ecardBuilder.toolbar
 * @name layers
 * @version 1.0
 * @author mbaijs
 */
 ;( function( $, context, appName )
 {

    var theApp      = $.getAndCreateContext( appName, context )
    ,   utils       = $.getAndCreateContext( "utils", theApp )
    ,   layers      = {}

    ,   settings    = {}
    ,	snippets    = {}

    ,   $ecardBuilder 
    ,   $module
    ,	$objectLayers
    ,   $buttonLayerRemove

    ,   $currentLayer = false
    ;

    theApp.toolbar.layers = layers;

    layers.initialize = function( options )
    {
    	settings = options;
        
        $ecardBuilder      = $( ".ecardBuilder" );

        // Get module DOM elements.
        //
        $module             = $( ".toolbarLayers" );
        $objectLayers       = $module.find( ".objectLayers" );
        $buttonLayerRemove  = $module.find( ".buttonLayerRemove" );
        $selectRenderEngine = $module.find( ".selectRenderEngine" );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu" : ".moduleMenu"
        ,   "tabs" : ".moduleBody" 
        });

        // Get snippets.
        //
        snippets.$objectLayerSnippet = $module.find( ".objectLayer" ).remove();

        // Listen to global app events.
        //
        $ecardBuilder.bind( "layerUpdate", layerUpdate );

        // Set Button events.
        //  
        $objectLayers.delegate( ".objectLayer", "click", layerSelect );
        $objectLayers.delegate( ".objectToggle", "click", layerToggle );
        $buttonLayerRemove.click( layerRemove );
        $selectRenderEngine.change( renderEngineSelect );
    };

    layers.getAllLayers = function()
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
        $buttonLayerRemove.removeClass( "buttonDisable" );

        // Tell the app what layer is now selected.
        //
        $ecardBuilder.trigger( "layerSelect", [ newLayerData ] );

        return false;
    }

    function layerUpdate( event, objectLayer )
    {
    	$currentLayer = $objectLayers.find( "#objectLayer" + objectLayer.id );
    	
        var	$layerClone = null;

        // This is a new layer. Create and select it.
        //
    	if( 0 === $currentLayer.length )
    	{
    		$objectLayers.find( ".active" ).removeClass( "active" );

    		$layerClone = snippets.$objectLayerSnippet.clone();
    		$layerClone.attr( "id", "objectLayer" + objectLayer.id );
    		$layerClone.data( "layer", objectLayer );
            $layerClone.find( ".objectLayerName" ).text( objectLayer.layerName );
    		
            if( objectLayer.image )
    		{
    			$layerClone.find( "img" ).attr( "src", objectLayer.image.src );
    		}

            if( objectLayer.text )
            {
                //$layerClone.find( "img" ).attr( "src", objectLayer.image.src );   
            }

    		$objectLayers.prepend( $layerClone );

    		layerSelect.call( $layerClone[0] );
    	}
        // Update layer
        //
    	else
    	{
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

        $ecardBuilder.trigger( "layerVisibility", [ layerToToggleData ] );

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
            $ecardBuilder.trigger( "layerRemove", [ currentLayerData ] );
            $ecardBuilder.trigger( "layerSelect", [ false ] );
            
            // Disable UI.
            //
            $buttonLayerRemove.addClass( "buttonDisable" );
        }

        return false;
    }

    function renderEngineSelect( event )
    {
        $ecardBuilder.trigger( "loadEngine", [ { name : event.target.value } ] );
    }

} )( jQuery, window, "ecardBuilder" );