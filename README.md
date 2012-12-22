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



