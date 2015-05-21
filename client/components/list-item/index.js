var Vue = require('vue'),
    template = require('./list-item.html');

var CrListItem = Vue.extend({
  template: template,
  methods: {
    removeItem: function (item) {
      item.$model.remove();
    }
  }
});

module.exports = Vue.component('cr-list-item', CrListItem);