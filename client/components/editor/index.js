var Vue = require('vue'),
    template = require('./editor.html');

module.exports = Vue.component('cr-editor', {
  template: template,
  methods: {
    addItem: function () {
      var newFruit = { name: '', cost: 0 };
      this.fruits.$model.pass({ local: true }).push(newFruit);
    },
    removeItem: function (index) {
      this.fruits.$model.pass({ local: true }).remove(index);
    },
    orderBy: function (prop) {
      this.$set('orderField', prop);
      this.$set('reverse', !this.$get('reverse'));
    }
  }
});