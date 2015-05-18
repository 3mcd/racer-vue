/**
 * Builds a live-updating object with non-enumerable references to
 * scoped models at each property. These objects can be observed and augmented
 * by data-binding implementations of client libraries like Angular and Vue.js, 
 * and the scoped model references can be used to trigger real time model
 * changes from
 * @param  {ChildModel} model  Racer model
 * @param  {String} path   Optional path to scope a model via model.at()
 * @param  {Object} parent Parent proxy object
 * @return {Object}        Proxy object
 */
module.exports = function modelProxy(model, path, parent) {
  /**
   * Determine scoped model if model is un-scoped and a model path was supplied.
   */
  if (!model._at && path) {
    model = model.at(path);
  }
  /**
   * Throw an error if model is un-scoped.
   */
  if (!model._at) {
    throw new Error('modelProxy() requires a scoped model or valid path.');
  }
  /**
   * Get the current state of the model. Racer will continuously update this
   * object, so it can be passed straight to an observer.
   */
  var proxy = model.get();
  /**
   * Recursively create modelProxy objects for each child path.
   */
  for (var prop in proxy) {
    if (proxy.hasOwnProperty(prop) && 'object' == typeof proxy[prop] && proxy[prop] !== null) {
      proxy[prop] = modelProxy(model.at(prop), prop, proxy);
    }
  }
  /**
   * Define $model and $subPath properties for use in our components to send
   * operations to the server. These properties are not enumerable so that Racer
   * won't try to serialize them and fail due to circular references
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
   * Build new proxy for each inserted value
   */
  model.on('insert', function onModelInsert(index, values, passed) {
    for (var i = 0; i < values.length; i++) {
      proxy[index + i] = modelProxy(model.at(index + i), index + i, proxy);
    }
  });
  /**
   * TODO: Update proxy based on other model events, if necessary.
   */
  return proxy;
};