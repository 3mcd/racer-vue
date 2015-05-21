var Vue = require('vue');

Vue.directive('live-text', {

  bind: function () {
    var expression = this.expression;
    this.handler = function () {
      var previous = this.vm.$data.$model.get(expression);
      if ('number' == typeof previous) {
        intOp(this.vm.$data.$model, expression, parseInt(this.el.value));
      } else {
        stringOp(this.vm.$data.$model, expression, this.el.value, previous);
      }
    }.bind(this);

    this.attr =
      this.el.nodeType === 3 ||
      this.el.tagName == "TEXTAREA" ||
      this.el.tagName == "INPUT" ? 'value' : 'textContent';

    this.el.addEventListener('input', this.handler);
  },

  update: function (value, previous) {
    value = value || '';

    if (previous === value) return;

    var pos = getInputSelection(this.el);

    this.el[this.attr] = value.toString();
    
    setInputSelection(this.el, pos.start, pos.end);
  },

  unbind: function () {
    this.el.removeEventListener('input', this.handler);
  }

});

function intOp(model, path, value) {
  model.set(path, value);
}

function stringOp(model, path, value, previous) {
  var start = 0,
      end = 0;

  previous = previous || '';

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
    model.stringRemove(path, start, howMany);
  }
  if (value.length !== start + end) {
    var inserted = value.slice(start, value.length - end);
    model.stringInsert(path, start, inserted);
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