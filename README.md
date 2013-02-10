[imageCreator](http://baijs.com/imagecreator) [![Build Status](https://secure.travis-ci.org/wieringen/imageCreator.png?branch=master)](http://travis-ci.org/wieringen/imageCreator)
==================================================

What you need to build your own version of imageCreator
--------------------------------------

In order to build imageCreator, you need to have Node.js/npm installed, and git 1.7 or later.


How to build your own imageCreator
----------------------------

First, clone a copy of the main imageCreator git repo by running:

```bash
git clone git://github.com/wieringen/imageCreator.git
```

Install the grunt-cli package so that you will have the correct version of grunt available from any project that needs it. This should be done as a global install:

```bash
npm install -g grunt-cli
```

Enter the imageCreator directory and install the Node dependencies, this time *without* specifying a global install:

```bash
cd imageCreator && npm install
```

Make sure you have `grunt` installed by testing:

```bash
grunt -version
```

Then, to get a complete, minified (w/ Uglify.js), linted (w/ JSHint) version of imageCreator, type the following:

```bash
grunt
```

The built version of imageCreator will be put in the `dist/` subdirectory, along with the minified copy and associated map file.


Questions?
----------

If you have any questions, please feel free to email [me](mailto:wieringen@gmail.com).



