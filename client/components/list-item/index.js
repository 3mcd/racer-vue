var Vue = require('vue'),
    template = require('./list-item.html');

var CrListItem = Vue.extend({
  template: template,
  ready: function () {
    this.$el.classList.add('CrListItem');
  },
  methods: {
    removeItem: function (item) {
      this.$data.$model.remove();
    }
  }
});

module.exports = Vue.component('cr-list-item', CrListItem);