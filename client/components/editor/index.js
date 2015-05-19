var Vue = require('vue'),
    template = require('./editor.html');

var CrEditor = Vue.extend({
  template: template,
  methods: {
    addItem: function () {
      var newFruit = { name: '', cost: 0 };
      this.fruits.$model.pass({ local: true }).push(newFruit);
    },
    removeItem: function (index) {
      this.fruits.$model.pass({ local: true }).remove(index);
    }
  }
});

module.exports = Vue.component('cr-editor', CrEditor);