/**
*
* @module services */

define(
[
    "config"
],
function( config, utilMisc )
{

    services.getFilters = function( params )
    {
        var options = $.extend(
        {
            successHandler: function(){}
        ,   errorHandler:   function(){}
        ,   username:       ""
        ,   password:       ""
        }, params );

        $.ajax(
        {
            type:   "POST"
        ,   url:    $hostUrl + "rest/tokens?username=" + options.username + '&password=' + options.password
        ,   success: function( data, status, xhr )
            {
                cache.storeCredentials( data );

                options.successHandler( { request: null, response: data, xhr: xhr } );
            }
        ,   error: function( xhr, status, error )
            {
                options.errorHandler( { request: null, response: error , xhr: xhr } );
            }
        } );
    };


} );