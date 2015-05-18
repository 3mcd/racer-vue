var Vue = require('vue');
var Racer = require('racer');
var bootstrap = JSON.parse(document.scripts[0].getAttribute('data-bundle'));
var Model = Racer.createModel(bootstrap);
var modelProxy = require('./racer-model-proxy');

require('./directives');
require('./components');

var store = modelProxy(Model.at('_page.store'));

window.store = store;

var app = new Vue({
  el: "body",
  data: {
    store: store
  }
});