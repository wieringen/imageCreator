[imageCreator](http://baijs.com/imagecreator) 
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

If you have any questions, please feel free to email me.



Letter
----------------------------

Hey all,

I have been working on a webapp for some time now and i wanted to share the result with you. Joel's presentation on RequireJS inspired me to start working on it again. RequireJs provided the structure and frame of mind i was looking for. Thanks dude :P

The App allows users to easily create images. In the long run this will be used in a Drupal Commerce plugin to enable users to creat e personalized products. Since i also wanted it to be a learning experience it uses no third party plugins or libs besides jquery and requirejs.

Some features:

- All layer calculations are done mathematically without help of the DOM and represented as transform matrixes. This allows for maximum browser compatibility and performance. IE supports matrixes since version 6.

- Every toolbox is a widget that can be turned off or on in the settings.

- Graphic polyfills kind of suck and are sometimes really slow and since i will only be using a subset of each graphics language i created seperate implementations for svg, canvas and vml. Especially vml was quite fun. You think HTML in IE can be weird? VML is just completely imsane! As a added bonus for not relying on the dom to calculate layer properties its possible to switch render engines on the fly.

- I tried to incorparate some cool html5 features like smil and drag and drop upload.

Demo
Source on github

Todo:

- I havent implemented text in canvas yet.
- There is no backend so its just a frontend prototype.

Greetings,

Maarten



