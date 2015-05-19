/**
 * Builds a live-updating proxy of a Racer model with non-enumerable references 
 * to scoped models at each property. This object can be observed by various
 * data-binding implementations, and the scoped model references can be used to
 * trigger real-time server changes from deeply nested properties in the proxy.
 * @param  {ChildModel} model  Racer model
 * @param  {String} path   Optional path to scope a model via model.at()
 * @param  {Object} parent Parent proxy object
 * @return {Object}        Proxy object
 */
module.exports = function modelProxy(model, path) {
  var paths = {};
  /**
   * Determine scoped model if model is un-scoped and a model path was supplied.
   */
  if (path !== null && path != void(0)) {
    model = model.at(path);
  }

  // WIP
  // var get = model.get;

  // model.get = function (path) {
  //   if (!paths[path]) {
  //     paths[path] = extend(get.call(model, path));

  //     model.on('all', path ? path + '**' : '**', function () {
  //       var data = extend(get.call(model, path));
  //     });
  //   }
  // };

  /**
   * Get the current state of the model. Racer will continuously update this
   * object, so it can be passed straight to an observer.
   */
  var proxy = model.get();
  /**
   * Recursively create proxy objects for each child object.
   */
  for (var prop in proxy) {
    if (proxy.hasOwnProperty(prop) && 'object' == typeof proxy[prop] && proxy[prop] !== null) {
      proxy[prop] = modelProxy(model, prop);
    }
  }
  /**
   * Define $model and $subPath properties for use in our components to send
   * operations to the server. These properties are not enumerable so that Racer
   * won't try to serialize them and fail due to circular references.
   */
  Object.defineProperties(proxy, {
    $model: {
      get: function () {
        return model;
      },
      enumerable: false
    },
    $subPath: {
      get: function () {
        return path;
      },
      enumerable: false
    }
  });
  /**
   * Build new proxy for each inserted value.
   */
  model.on('insert', function onModelInsert(index, values, passed) {
    for (var i = 0; i < values.length; i++) {
      proxy[index + i] = modelProxy(model, index + i, proxy);
    }
  });
  /**
   * TODO: Update proxy based on other model events, if necessary.
   */
  return proxy;
};

function extend(from, to) {
    if (from === to) return to;

    if (from.constructor === Array && to && to.constructor === Array) {
      for (var i = 0; i < from.length; ++i) {
        to[i] = extendObject(from[i], to[i]);
      }
      to.splice(from.length, to.length);

      return to;
    } else if (from instanceof Object && to && to instanceof Object) {
      for (var key in to) {
        if (typeof from[key] === 'undefined' || key === '$$hashKey') {
          delete to[key];
        }
      }

      for (key in from) {
        if (key === '$$hashKey') continue;

        to[key] = extendObject(from[key], to[key]);
      }

      return to;
    } else if (to === undefined) {
      return extendObject(from, new from.constructor());
    } else {
      return from;
    }
  }