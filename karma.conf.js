// Karma configuration file
//
// For all available config options and default values, see:
// https://github.com/karma-runner/karma/blob/stable/lib/config.js#L54

// base path, that will be used to resolve files and exclude
//
basePath = '';

// list of files / patterns to load in the browser
//
files = [

    // frameworks
    JASMINE,
    JASMINE_ADAPTER,
    REQUIRE,
    REQUIRE_ADAPTER,

    { pattern: "src/core/util.math.coffee", included: false},
    { pattern: 'test/spec/**/*.spec.js', included: false},

    "test/test-main.js"
];

// use dots reporter, as travis terminal does not support escaping sequences
//
reporters = [
  'dots'
];

// web server port
//
port = 9876;

// cli runner port
//
runnerPort = 9100;

// enable / disable colors in the output (reporters and logs)
//
colors = true;

// level of logging
//
logLevel = LOG_INFO;

// Start these browsers, currently available:
//
browsers = [ "PhantomJS" ];

// If browser does not capture in given timeout [ms], kill it
//
captureTimeout = 5000;

// Auto run tests on start (when browsers are captured) and exit
//
singleRun = true;

// report which specs are slower than 500ms
//
reportSlowerThan = 500;