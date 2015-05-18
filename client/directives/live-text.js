var Vue = require('vue');

Vue.directive('live-text', {

  twoWay: true,

  bind: function () {
    var _this = this;

    this.scoped = _this.vm.$data.$model.at(this.expression);
    this.type = typeof this.scoped.get();

    this.handler = function () {
      if ('number' == _this.type) {
        intOp(_this.scoped, parseInt(_this.el.value));
      } else {
        stringOp(_this.scoped, _this.el.value, _this.scoped.get());
      }
    };

    this.attr = this.el.nodeType === 3 || this.el.tagName == "TEXTAREA" || this.el.tagName == "INPUT"
      ? 'value'
      : 'textContent';

    this.el.addEventListener('keyup', this.handler);
  },

  update: function (value, previous) {
    value = value || '';

    if (previous === value) return;

    var pos = getInputSelection(this.el);

    this.el[this.attr] = value.toString();
    
    setInputSelection(this.el, pos.start, pos.end);
  }

});

function intOp(model, value) {
  model.pass({ local: true }).set(value);
}

function stringOp(model, value, previous) {
  var start = 0,
      end = 0;

  if (previous === value) return;

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
    model.pass({ local: true }).stringRemove(start, howMany);
  }
  if (value.length !== start + end) {
    var inserted = value.slice(start, value.length - end);
    model.pass({ local: true }).stringInsert(start, inserted);
  }
}

function getInputSelection(el) {
  var start = 0, end = 0, normalizedValue, range,
      textInputRange, len, endRange;

  if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
    start = el.selectionStart;
    end = el.selectionEnd;
  } else {
    range = document.selection.createRange();

    if (range && range.parentElement() == el) {
      len = el.value.length;
      normalizedValue = el.value.replace(/\r\n/g, "\n");

      // Create a working TextRange that lives only in the input
      textInputRange = el.createTextRange();
      textInputRange.moveToBookmark(range.getBookmark());

      // Check if the start and end of the selection are at the very end
      // of the input, since moveStart/moveEnd doesn't return what we want
      // in those cases
      endRange = el.createTextRange();
      endRange.collapse(false);

      if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
        start = end = len;
      } else {
        start = -textInputRange.moveStart("character", -len);
        start += normalizedValue.slice(0, start).split("\n").length - 1;

        if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
          end = len;
        } else {
          end = -textInputRange.moveEnd("character", -len);
          end += normalizedValue.slice(0, end).split("\n").length - 1;
        }
      }
    }
  }

  return {
    start: start,
    end: end
  };
}

function offsetToRangeCharacterMove(el, offset) {
  return offset - (el.value.slice(0, offset).split("\r\n").length - 1);
}

function setInputSelection(el, startOffset, endOffset) {
  if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
    el.selectionStart = startOffset;
    el.selectionEnd = endOffset;
  } else {
    var range = el.createTextRange();
    var startCharMove = offsetToRangeCharacterMove(el, startOffset);
    range.collapse(true);
    if (startOffset == endOffset) {
        range.move("character", startCharMove);
    } else {
        range.moveEnd("character", offsetToRangeCharacterMove(el, endOffset));
        range.moveStart("character", startCharMove);
    }
    range.select();
  }
}