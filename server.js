var fs = require('fs');
var http = require('http');
var express = require('express');
var liveDbMongo = require('livedb-mongo');
var redis = require('redis').createClient();
var racerBrowserChannel = require('racer-browserchannel');
var racer = require('racer');
var stringify = require('stringify');

racer.use(require('racer-bundle'));

redis.select(14);

var store = racer.createStore({
  db: liveDbMongo('localhost:27017/code-rally?auto_reconnect', {safe: true}),
  redis: redis
});

app = express();
app
  .use(express.favicon())
  .use(express.compress())
  .use(racerBrowserChannel(store))
  .use(store.modelMiddleware())
  .use(app.router);

app.use(function(err, req, res, next) {
  console.error(err.stack || (new Error(err)).stack);
  res.send(500, 'Something broke!');
});

function scriptBundle(cb) {
  // Use Browserify to generate a script file containing all of the client-side
  // scripts, Racer, and BrowserChannel
  store.bundle(__dirname + '/client/index.js', {
    transform: stringify({
      extensions: ['.html'], minify: true
    })
  }, function(err, js) {
    if (err) return cb(err);
    cb(null, js);
  });
}
// Immediately cache the result of the bundling in production mode, which is
// deteremined by the NODE_ENV environment variable. In development, the bundle
// will be recreated on every page refresh
if (racer.util.isProduction) {
  scriptBundle(function(err, js) {
    if (err) return;
    scriptBundle = function(cb) {
      cb(null, js);
    };
  });
}

app.get('/script.js', function(req, res, next) {
  scriptBundle(function(err, js) {
    if (err) return next(err);
    res.type('js');
    res.send(js);
  });
});

app.get('/model/:roomId', function(req, res, next) {
  var model = req.getModel();
  
  if (!/^[a-zA-Z0-9_-]+$/.test(req.params.roomId)) return next();

  var roomPath = 'stores.' + req.params.roomId;

  model.subscribe(roomPath, function(err) {
    if (err) return next(err);

    var scoped = model.ref('_page.store', roomPath);

    if (!scoped.get()) {
      scoped.set({
        name: '',
        html: '',
        fruits: []
      });
    }

    model.bundle(function(err, bundle) {
      if (err) return next(err);
      res.send(JSON.stringify(bundle));
    });
  });
});

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

var port = process.env.PORT || 51893;

http.createServer(app).listen(port, function() {
  console.log('Go to http://localhost:' + port);
});