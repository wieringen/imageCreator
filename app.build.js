({
    baseUrl  : "./src",
    dir      : "src",
    optimize : "none",
    wrap     : true,

    paths: {
        "jquery"      : "empty:"
    },

    modules : 
    [
        {   name: "lib/require/domReady" }
    ,   {   name: "lib/require/text" }
    ,   {   name: "lib/require/lazyRequire" }

    ,   {   name: "core/main" }
    ,   {   name: "core/utils" }
    ,   {   name: "core/selection" }    
    ]

})