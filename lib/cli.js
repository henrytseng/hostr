'use strict';

// Dependencies
var Argr = require('argr');
var _ = require('lodash');

// Configuration
var pkg = require(__dirname+'/../package.json');

// Command-line Interface
var argr = Argr()

  .option(['l', 'livereload'], 'Use LiveReload automatic browser refresh (default=enabled)', true)
  .option(['r', 'livereload-port'], 'WebSocket port to use for LiveReload (35729)', 35729)

  .option(['c', 'cache-expiration'], 'Cache expiration time in seconds (default=60)', 60)

  .option(['w', 'watch'], 'Use watch (default=enabled)', true)
  .option(['p', 'port'], 'HTTP port (3000)', 3000)
  .option(['q', 'quiet'], 'Quiet mode');

// CLI Initialize
argr.init(process.argv);

// Debugging
process.env.QUIET = argr.get('quiet');
var debug = require('./debug')(process.env.QUIET === 'true');

// LiveReload
var reloader;
if(argr.get('livereload')) {
  var tinylr = require('tiny-lr');
  var rport = process.env.LIVERELOAD_PORT || argr.get('livereload-port');

  reloader = tinylr();
  rport = isNaN(rport) ? 35729 : +rport;
  reloader.listen(rport, function() {
    debug.log('LiveReload '+rport);
  });
}

// Serve
var statics;
var port = process.env.PORT || argr.get('port');
var server = require('./server')({
  port: port
})
  .use(statics = require('./routes/statics')({
    cacheExpiration: argr.get('cache-expiration')
  }))
  .use(require('./routes/notfound')())
  .start();

// Watch
if(argr.get('watch')) {
  require('./watch')({
    reloader: tinylr,
    statics: statics
  });
}
