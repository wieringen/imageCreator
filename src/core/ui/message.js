/**
*
* @module message
*/

define(
[
    // Template.
    //
    "text!templates/message.html"

    // Core.
    //
,   "config"
],
function( moduleHTML, config )
{
    var module =
        {
            enabled  : true
        ,   options  : config.options.ui.message
        }

    ,   messageDefaults =
        {
            "message"   : ""
        ,   "status"    : ""
        ,   "fade"      : true
        ,   "fadeTimer" : 300
        }

    ,   $imageCreatorViewport

    ,   $module
    ,   $imageCreatorMessage
    ,   $imageCreatorMessageInner
    ,   $imageCreatorMessageClose
    ;

    module.initialize = function()
    {
        // Append module HTML.
        //
        $( module.options.target ).replaceWith( moduleHTML );

        // Get main DOM elements.
        //
        $imageCreatorViewport = $( ".imageCreatorViewport" );

        // Get module DOM elements.
        //
        $imageCreatorMessage      = $( ".imageCreatorUIMessage" );
        $imageCreatorMessageInner = $( ".imageCreatorMessageInner" );
        $imageCreatorMessageClose = $( ".imageCreatorMessageClose" );

        // Listen for module UI events.
        //
        $imageCreatorMessageClose.bind( "tap", messageClose );

        // Listen for global events.
        //
        $.subscribe( "message", messageBroadcast );
    };

    function messageBroadcast( event, parameters )
    {
        var options      = $.extend( {}, messageDefaults, parameters )
        ,   messageTimer = $imageCreatorMessage.data( "messageTimer" )
        ;

        $imageCreatorMessage.removeClass( "error loading notice" );
        $imageCreatorMessage.addClass( options.status );
        $imageCreatorMessage.show();

        $imageCreatorMessageInner.text( options.message );

        if( options.fade )
        {
            clearTimeout( messageTimer );

            messageTimer = setTimeout( function()
            {
                $imageCreatorMessage.hide();
            }, options.fadeTimer );

            $imageCreatorMessage.data( "messageTimer", messageTimer );
        }
    }

    function messageClose()
    {
        $imageCreatorMessage.hide();
    }

    return module;
} );