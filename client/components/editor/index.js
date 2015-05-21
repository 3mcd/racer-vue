var Vue = require('vue'),
    template = require('./editor.html');

var CrEditor = Vue.extend({
  ready: function () {
    this.$el.classList.add('CrEditor');
    this.$ul = this.$el.querySelector('ul');
  },  
  template: template,
  methods: {
    addItem: function () {
      var newFruit = { name: '', cost: 0 };
      this.fruits.$model.push(newFruit);
    },
    onMousedown: function (e) {
      this.$ul.style.height = this.$ul.clientHeight + 'px';
      console.log(e.target.tagName);
      if (e.target.tagName == 'CR-LIST-ITEM') {
        this.activeItem = e.srcElement;
      }
    },
    onMousemove: function (e) {
      setTimeout(function () {
        if (this.activeItem) {
          this.activeItem.style.position = 'fixed';
          this.activeItem.style.top = e.clientY + 'px';
        }
      }.bind(this), 0);
    },
    onMouseup: function (e) {
      var listItems = Array.prototype.slice.call(this.$ul.querySelectorAll('cr-list-item')),
          listItem,
          ulRect = getRect(this.$ul),
          activeRect,
          activeIndex = listItems.indexOf(this.activeItem),
          rect;

      if (this.activeItem) {
        activeRect = getRect(this.activeItem);
        if (activeRect.bottom < ulRect.top) {
          this.fruits.$model.move(activeIndex, 0);
        } else if (activeRect.top > ulRect.bottom) {
          this.fruits.$model.move(activeIndex, this.fruits.length - 1);
        } else {
          for (var i = 0; i < listItems.length; i++) {
            listItem = listItems[i];
            rect = getRect(listItem);
            /**
             * If the distance between the center of each rect is less than half
             * of the the radius of the y axis.
             */
            if (Math.abs((rect.top - (rect.height / 2)) - (activeRect.top - (activeRect.height / 2))) < (activeRect.height / 2)) {
              console.log(listItems.indexOf(this.activeItem), i);
              this.fruits.$model.move(activeIndex, i);
            }
          }
        }
        this.activeItem.style.position = 'static';
      }

      this.$ul.style.height = null;
      this.activeItem = null;
    }
  }
});

function getRect(el) {
  return el.getBoundingClientRect();
}

function contains(rect1, rect2) {
  return {
    top     : rect1.top <= rect2.top,
    bottom  : rect1.right >= rect2.right,
    left    : rect1.bottom >= rect2.bottom,
    right   : rect1.left <= rect2.left
  };
}

module.exports = Vue.component('cr-editor', CrEditor);