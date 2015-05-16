var Vue = require('vue');

Vue.directive('racer-model', {

  bind: function () {
    var _this = this;

    var model = this.model = this.vm.$data.model.at(this.expression);

    this.handler = function () {
      _this.update(_this.el.value, _this._watcher.get());
    };

    this.expression = this._watcherExp = this.raw = 'model.root.data.' + this.expression;

    if (this.el.type == 'textarea' || this.el.type == 'text') {

      this.el.addEventListener('keyup', this.handler);

      model.on('change', function(value, previous, passed) {
        var index, text, howMany, transformCursor, newText;

        if (passed.local) return;

        if (!passed.$type) {
          _this.el.value = value || '';
          return;
        }

        if (passed.$type === 'stringInsert') {
          index = passed.index;
          text = passed.text;
          transformCursor = function(cursor) {
            return (index < cursor) ? cursor + text.length : cursor;
          };
          newText = previous.slice(0, index) + text + previous.slice(index);
        } else if (passed.$type === 'stringRemove') {
          index = passed.index;
          howMany = passed.howMany;
          transformCursor = function(cursor) {
            return (index < cursor) ? Math.max(index, cursor - howMany) : cursor;
          };
          newText = previous.slice(0, index) + previous.slice(index + howMany);
        }

        _this.el.value = newText;
        _this.el.textContent = newText;
        
        updateCursor(_this.el, transformCursor);
      });
    }
  },

  update: function (value, previous) {
    var model = this.model,
        start = 0,
        end = 0;

    if (previous === value) return;

    if (this.el.type == 'textarea' || this.el.type == 'text') {
      this.el.value = value;
    } else {
      this.el.textContent = value;
    }

    while (previous && (previous.charAt(start) == value.charAt(start))) {
      start++;
    }

    while (
      previous.charAt(previous.length - 1 - end) === value.charAt(value.length - 1 - end) &&
      end + start < previous.length &&
      end + start < value.length
    ) {
      end++;
    }

    if (previous.length !== start + end) {
      var howMany = previous.length - start - end;
      model.pass({local: true}).stringRemove(start, howMany);
    }
    if (value.length !== start + end) {
      var inserted = value.slice(start, value.length - end);
      model.pass({local: true}).stringInsert(start, inserted);
    }
  },

  unbind: function () {
    this.el.removeEventListener('input', this.handler);
    this.model.removeAllListeners();
  }

});

function updateCursor(pad, transformCursor) {
  var start = pad.selectionStart;
  var end = pad.selectionEnd;
  var scrollTop = pad.scrollTop;

  if (pad.scrollTop !== scrollTop) {
    pad.scrollTop = scrollTop;
  }

  if (document.activeElement === pad) {
    pad.selectionStart = transformCursor(start);
    pad.selectionEnd = transformCursor(end);
  }
}