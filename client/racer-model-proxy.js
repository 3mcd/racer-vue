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
function modelProxy(model, path) {
  /**
   * Determine scoped model if model is un-scoped and a model path was supplied.
   */
  if (path !== null && path != void(0)) {
    model = model.at(path);
  }
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
      enumerable: false,
      configurable: true
    }
  });
  /**
   * Build new proxy for each inserted value.
   */
  model.on('insert', function onModelInsert(index, values, passed) {
    for (var i = 0; i < values.length; i++) {
      proxy[index + i] = modelProxy(model, index + i);
    }
  });
  /**
   * Re-evaluate child proxy objects.
   */
  model.on('move', function onModelMove(from, to, howMany, passed) {
    var right = from < to;
    
    to = right ? to + 1 : to - 1;

    for (; from !== to; right ? from++ : from--) {
      cleanupProxy(proxy[from]);
      proxy[from] = modelProxy(model, from);
    }
  });
  /**
   * Cleanup removed objects' model refs and event listeners.
   */
  model.on('remove', function onModelRemove(index, values, passed) {
    var end = proxy.length;

    for (; index <= end - 1; index++) {
      cleanupProxy(proxy[index]);
      proxy[index] = modelProxy(model, index);
    }

    cleanupProxies(values);
  });
  /**
   * TODO: Update proxy based on other model events, if necessary.
   */
  return proxy;
}

module.exports = modelProxy;

/**
 * Remove model refs and event listeners from a proxy object.
 * @param  {Object} proxy Proxy object
 * @return {void}
 */
function cleanupProxy(proxy) {
  if ('object' == typeof proxy.$model) {
    proxy.$model.removeAllListeners();
    delete proxy.$model;
    for (var prop in proxy) {
      if (proxy.hasOwnProperty(prop) && 'object' == typeof proxy[prop] && proxy[prop] !== null) {
        cleanupProxy(proxy[prop]);
      }
    }
  }
}

/**
 * Execute cleanupProxy for each model in an array or list of arguments.
 * @param  {Array} args List of proxy objects
 * @return {void}
 */
function cleanupProxies(args) {
  args = Array.prototype.slice.call(args || arguments);
  for (var i = 0; i < args.length; i++) {
    cleanupProxy(args[i]);
  }
}