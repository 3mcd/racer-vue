var data = JSON.parse(document.scripts[0].getAttribute('data-bundle'));
var MODEL = window.MODEL = require('racer').createModel(data);
var Vue = require('vue');

// model.at() scopes all model operations underneath a particular path
model = MODEL.at('_page.room');

var pad = document.getElementById('pad');

var _previous = MODEL.data._page.room;

Vue.filter('reverse', function (value) {
  return value.split('').reverse().join('');
});

var test = new Vue({
  el: '#lol',
  data: MODEL.data._page,
  methods: {
    onKeyup: function () {
      setTimeout(onInput, 0);
    }
  }
});

var test2 = new Vue({
  el: pad,
  data: MODEL.data._page,
  methods: {
    onKeyup: function () {
      setTimeout(onInput, 0);
    }
  }
});

var test3 = new Vue({
  el: '#lol2',
  data: MODEL.data._page,
  methods: {
    onKeyup: function () {
      setTimeout(onInput, 0);
    }
  }
});

function onInput() {
  // IE and Opera replace \n with \r\n
  var value = MODEL.data._page.room.replace(/\r\n/g, '\n');

  applyChange(model, _previous, value);

  _previous = value;
}

model.on('change', function(value, previous, passed) {
  var index, text, howMany;

  if (passed.local) return;

  if (!passed.$type) {
    pad.value = value || '';
    return;
  }

  var transformCursor;

  if (passed.$type === 'stringInsert') {
    index = passed.index;
    text = passed.text;
    transformCursor = function(cursor) {
      return (index < cursor) ? cursor + text.length : cursor;
    };
  } else if (passed.$type === 'stringRemove') {
    index = passed.index;
    howMany = passed.howMany;
    transformCursor = function(cursor) {
      return (index < cursor) ? Math.max(index, cursor - howMany) : cursor;
    };
  }

  updateCursor(pad, transformCursor);
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

// Create an op which converts previous -> value.
//
// This function should be called every time the text element is changed.
// Because changes are always localized, the diffing is quite easy.
//
// This algorithm is O(N), but I suspect you could speed it up somehow using
// regular expressions.
function applyChange(model, previous, value) {
  if (previous === value) return;

  var start = 0;

  while (previous.charAt(start) == value.charAt(start)) {
    start++;
  }

  var end = 0;

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
}