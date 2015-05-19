/**
 * Object Methods
 */
function extend(from, to) {
  if (from === to) return to;
  if (from.constructor === Array && to && to.constructor === Array) {
    for (var i = 0; i < from.length; ++i) {
      to[i] = extend(from[i], to[i]);
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
      to[key] = extend(from[key], to[key]);
    }
    return to;
  } else if (to === undefined) {
    return extend(from, new from.constructor());
  } else {
    return from;
  }
}

module.exports = {
  extend: extend
};