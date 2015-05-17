var Vue = require('vue'),
    template = require('./editor.html');

module.exports = Vue.component('cr-editor', {
  template: template,
  methods: {
    onAddClick: function () {
      var newFruit = { name: '', cost: 0 };
      this.fruits.$ref.pass({ local: true }).push(newFruit);
    }
  }
});