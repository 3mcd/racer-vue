var Vue = require('vue'),
    template = require('./output.html');

var CrOutput = Vue.extend({
  inherit: true,
  template: template,
  data: function () {
    return {
      orderField: 'cost',
      reverse: true
    };
  },
  methods: {
    orderBy: function (prop) {
      this.orderField = prop;
      this.reverse = !this.reverse;
    }
  }
});

module.exports = Vue.component('cr-output', CrOutput);