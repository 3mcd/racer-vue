module.exports = function modelProxy(model, path, parent) {
  // Ensure model is scoped
  if (!model._at && path) {
    model = model.at(path);
  }

  if (!model._at) {
    throw new Error('modelProxy() requires a scoped model or valid path.');
  }

  var proxy = model.get();

  // TODO: Check if array or obj here
  for (var prop in proxy) {
    if (proxy.hasOwnProperty(prop) && 'object' == typeof proxy[prop] && proxy[prop] !== null) {
      proxy[prop] = modelProxy(model.at(prop), prop, proxy);
    }
  }

  proxy.$model = model;
  proxy.$subPath = path;

  // Build new proxy for each inserted value
  model.on('insert', function onModelInsert(index, values, passed) {
    for (var i = 0; i < values.length; i++) {
      proxy[index + i] = modelProxy(model.at(index + i), index + i, proxy);
    }
  });

  model.on('remove', function onModelRemove(index, values, passed) {

  });

  model.on('move', function onModelMove(from, to, howMany, passed) {

  });
  
  model.on('change', function onModelChange(value, previous, passed) {

  });

  return proxy;
}