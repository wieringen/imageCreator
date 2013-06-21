define(
[
    // Template.
    //
    "text!templates/effects.html"

    // Core.
    //
,   "config"
,   "cache"

    // Libraries.
    //
,   "plugins/jquery.tabular"
,   "plugins/jquery.slider"
],
function( moduleHTML, config, cache )
{
    var module =
        {
            enabled  : true
        ,   options  : config.options.ui.effects
        ,   snippets : {}
        }

    ,   $imageCreatorViewport

    ,   $module
    ,   $filterStrength
    ,   $filterTypesList
    ,   $maskTypeList

    ,   layerCurrent = false
    ;

    module.initialize = function( options )
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $module         = $( module.options.target );
        $filterStrength = $module.find( ".filterStrength" );
        $filterTypeList = $module.find( ".filterTypeList" );
        $maskTypeList   = $module.find( ".maskTypeList" );

        // Initialize module UI.
        //
        $module.tabular(
        {
            "menu"  : ".moduleMenu"
        ,   "tabs"  : "a"
        ,   "pages" : ".moduleTab"
        });
        $filterStrength.slider(
        {
            "start" : 100
        ,   "scale" : [ 0, 100 ]
        ,   "unit"  : "%"
        });

        // Listen for module UI events.
        //
        $filterStrength.bind( "onDrag", filterStrength );
        $filterTypeList.change( filterType );
        $maskTypeList.change( maskType );

        // Listen for global events.
        //
        $.subscribe( "layerSelect", layerSelect );
        $.subscribe( "layerVisibility", layerVisibility );

        // Get snippets.
        //
        module.snippets.$filterTypeSnippet = $module.find( ".filterTypeOption" ).remove();
        module.snippets.$maskTypeSnippet   = $module.find( ".maskTypeOption" ).remove();

        // Populate the module ui.
        //
        populateUI();
    };

    function populateUI()
    {
        $.each( module.options.filters.color, function( filterKey, filter )
        {
            var $filterTypeClone = module.snippets.$filterTypeSnippet.clone();

            $filterTypeClone.attr( "value", filterKey );
            $filterTypeClone.text( filter.name );

            $filterTypeList.append( $filterTypeClone );
        });

        $.each( module.options.masks, function( maskKey, mask )
        {
            var $maskTypeClone = module.snippets.$maskTypeSnippet.clone();

            $maskTypeClone.attr( "value", maskKey );
            $maskTypeClone.text( mask.name );

            $maskTypeList.append( $maskTypeClone );
        });
    }

    function layerVisibility( event, layer )
    {
        if( layer.selected )
        {
            // We only want to set the module ui state when were toggling the visibility of the currently selected layer.
            //
            layerSelect( event, layer );
        }
    }

    function layerSelect( event, layer )
    {
        // Enable module if the layer supports filters.
        //
        module.enabled = layer.visible && layer.filter || false;

        $module.toggleClass( "moduleDisabled", ! module.enabled );
        $module.toggleClass( "moduleLocked", ! layer.locked );

        if( module.enabled )
        {
            layerCurrent = layer;

            // Set the UI to match the selected layers properties.
            //
            $filterTypeList.val( layerCurrent.filter.name.toLowerCase() );
            $maskTypeList.val( layerCurrent.mask.name.toLowerCase() );

            if( layerCurrent.filter.matrix )
            {
                $filterStrength.removeClass( "disabled" );
                $filterStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );
            }
            else
            {
                $filterStrength.addClass( "disabled" );
            }
        }
    }

    function filterType( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setImageManipulated( null );

            layerCurrent.setFilter( $.extend( true, {}, module.options.filters.color[ this.value ] ) );

            $filterStrength.toggleClass( "disabled", ! layerCurrent.filter.matrix );

            $filterStrength.trigger( "setPosition", [ layerCurrent.filter.strength * 100 ] );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function filterStrength( event, strength )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setImageManipulated( null );

            layerCurrent.setFilterStrength( strength );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    function maskType( event )
    {
        if( module.enabled && layerCurrent && layerCurrent.visible )
        {
            layerCurrent.setImageManipulated( null );

            layerCurrent.setMask( module.options.masks[ this.value ].name );

            $.publish( "layerUpdate", [ layerCurrent ] );
        }
    }

    return module;
} );