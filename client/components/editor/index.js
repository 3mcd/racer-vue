var Vue = require('vue'),
    template = require('./editor.html');

var CrEditor = Vue.extend({
  template: template,
  methods: {
    addItem: function () {
      var newFruit = { name: '', cost: 0 };
      this.fruits.$model.push(newFruit);
    }
  }
});

module.exports = Vue.component('cr-editor', CrEditor);