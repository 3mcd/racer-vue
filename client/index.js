var Vue = require('vue');
var racer = require('racer');
var modelProxy = require('./racer-model-proxy');
var http = require('superagent');

require('./directives');
require('./components');

// TODO: Implement client-side routing
http.get('/model/eric').end(function (err, res) {
  var data = JSON.parse(res.text);
  var model = window.model = racer.createModel(data);
  var store = window.store = modelProxy(model.at('_page.store'));

  var app = new Vue({
    el: "body",
    data: {
      store: store
    }
  });
});