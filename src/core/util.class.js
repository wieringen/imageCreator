/**
 * @description <p>A collection of reusable utility functions.</p>
 *
 * @namespace imageCreator
 * @name utils
 * @version 1.0
 * @author mbaijs
 */
define(
[],
function()
{
    var module = {};

    var slice = Array.prototype.slice
    ,   emptyFunction = function() { }
    ;

    var IS_DONTENUM_BUGGY = (function()
    {
        for (var p in { toString: 1 })
        {
            if (p === 'toString') return false;
        }
        return true;
    })();

    var addMethods = function(base, source, parent)
    {
        for (var property in source)
        {

        if (property in base.prototype &&
          typeof base.prototype[property] === 'function' &&
          (source[property] + '').indexOf('callSuper') > -1) {

        base.prototype[property] = (function(property) {
          return function() {

            var superclass = this.constructor.superclass;
            this.constructor.superclass = parent;
            var returnValue = source[property].apply(this, arguments);
            this.constructor.superclass = superclass;

            if (property !== 'initialize') {
              return returnValue;
            }
          };
        })(property);
      }
      else {
        base.prototype[property] = source[property];
      }

      if (IS_DONTENUM_BUGGY) {
        if (source.toString !== Object.prototype.toString) {
          base.prototype.toString = source.toString;
        }
        if (source.valueOf !== Object.prototype.valueOf) {
          base.prototype.valueOf = source.valueOf;
        }
      }
    }
  };

  function Subclass() { }

  function callSuper(methodName) {
    var fn = this.constructor.superclass.prototype[methodName];
    return (arguments.length > 1)
      ? fn.apply(this, slice.call(arguments, 1))
      : fn.call(this);
  }

  /**
   * Helper for creation of "classes". Note that pr
   * @method createClass
   * @param parent optional "Class" to inherit from
   * @param properties Properties shared by all instances of this class
   *                  (be careful modifying objects defined here as this would affect all instances)
   * @memberOf fabric.util
   */
  module.createClass = function()
  {
    var parent = null,
        properties = slice.call(arguments, 0);

    if (typeof properties[0] === 'function') {
      parent = properties.shift();
    }
    function base() {
      this.initialize.apply(this, arguments);
    }

    base.superclass = parent;
    base.subclasses = [ ];

    if (parent) {
      Subclass.prototype = parent.prototype;
      base.prototype = new Subclass();
      parent.subclasses.push(base);
    }
    for (var i = 0, length = properties.length; i < length; i++) {
      addMethods(base, properties[i], parent);
    }
    if (!base.prototype.initialize) {
      base.prototype.initialize = emptyFunction;
    }
    base.prototype.constructor = base;
    base.prototype.callSuper = callSuper;
    return base;
  }


    return module;
});