// Define the module.
define(
	[
		"require"
	],
	function( require ){


		// Define the states of loading for a given set of modules
		// within a require() statement.
		var states = {
			unloaded: "UNLOADED",
			loading: "LOADING",
			loaded: "LOADED"
		};


		// Define the top-level module container. Mostly, we're making
		// the top-level container a non-Function so that users won't
		// try to invoke this without calling the once() method below.
		var lazyRequire = {};


		// I will return a new, unique instance of the requrieOnce()
		// method. Each instance will only call the require() method
		// once internally.
		lazyRequire.once = function(){

			// The modules start in an unloaded state before
			// requireOnce() is invoked by the calling code.
			var state = states.unloaded;

			var requireOnce = function( dependencies, loadCallback, runCallback ){

				// Use the module state to determine which method to
				// invoke (or just to ignore the invocation).
				if (state === states.loaded){

					// Invoke the run callback - the modules have
					// been loaded.
					runCallback();

				// The modules have not yet been requested - let's
				// lazy load them.
				} else if (state === states.unloaded){

					// We're about to load the modules asynchronously;
					// flag the interim state.
					state = states.loading;

					// Load the modules.
					require(
						dependencies,
						function(){

							// Invoke the load callback with the
							// loaded module definitions so that the
							// calling code can use the module
							// defitions to lazily initialize code.
							loadCallback.apply( null, arguments );

							// Update the state - the modules have
							// been loaded and the calling code has
							// been initialized.
							state = states.loaded;

							// Explicitly invoke the run callback
							// since we always want to use the modules
							// after they have first been loaded.
							runCallback();

						}
					);

				// RequireJS is currently loading the modules
				// asynchronously, but they have not finished
				// loading yet.
				} else {

					// Simply ignore this call.
					return;

				}

			};

			// Return the new lazy loader.
			return( requireOnce );

		};


		// -------------------------------------------------- //
		// -------------------------------------------------- //


		// Return the module definition.
		return( lazyRequire );


	}
);