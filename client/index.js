var Vue = require('vue');
var Racer = require('racer');
var bootstrap = JSON.parse(document.scripts[0].getAttribute('data-bundle'));
var Model = Racer.createModel(bootstrap);

require('./directives/index');
require('./components/index');

var editor = new Vue({
  el: "body",
  data: {
    model: Model
  }
});