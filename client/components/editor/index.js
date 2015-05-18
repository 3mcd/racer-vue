var Vue = require('vue'),
    template = require('./editor.html');

module.exports = Vue.component('cr-editor', {
  template: template,
  created: function () {
    this.$set('orderField', 'cost');
    this.$set('reverse', true);
  },
  methods: {
    addItem: function () {
      var newFruit = { name: '', cost: 0 };
      this.fruits.$model.pass({ local: true }).push(newFruit);
    },
    removeItem: function (index) {
      console.log(index);
      this.fruits.$model.pass({ local: true }).remove(index);
    },
    orderBy: function (prop) {
      this.orderField = prop;
    }
  }
});