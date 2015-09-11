'use strict';

// Dependencies
var path = require('path');
var Argr = require('argr');
var _ = require('lodash');

// Configuration
var pkg = require(__dirname+'/../package.json');

// Command-line Interface
var argr = Argr()
  .useStrict(true)

  .option(['l', 'livereload'], 'Use LiveReload automatic browser refresh (default=enabled)', true)
  .option(['r', 'livereload-port'], 'WebSocket port to use for LiveReload (35729)', 35729)

  .option(['c', 'cache-expiration'], 'Cache expiration time in seconds (default=60)', 60)

  .option(['w', 'watch'], 'Use watch (default=enabled)', true)
  .option(['p', 'port'], 'HTTP port (3000)', 3000)
  .option(['q', 'quiet'], 'Quiet mode')

  .option(['h', 'help', '?'], 'Display help');

/**
 * Show help
 */
function _displayHelp() {
  console.log('Usage: '+argr.command().split(path.sep).pop());

  // Build options
  var maxLine = '';
  var i;
  var line;
  var instructions = [];
  argr.options().forEach(function(option) {
    var params = option.param.slice(0).map(function(p) {
      return (p.length === 1) ? '-'+p : '--'+p;
    });

    line = params.join(', ');
    if(line.length > maxLine.length) maxLine = line;
    instructions.push(line);
  });

  // Add descriptions
  argr.options().forEach(function(option, i) {
    var blanks = Array((maxLine.length + 3) - instructions[i].length).join(' ');
    line = ' ' + instructions[i] + blanks + option.description;
    instructions[i] = line;
  });
  console.log(instructions.join("\n"));
}

// CLI Initialize
// Check arguments
try {
  argr.init(process.argv);

} catch(e) {
  console.error("Syntax error\n");
  _displayHelp();
  process.exit(1);
}

// Display help
if(argr.get('h')) {
  _displayHelp();
  process.exit();
}

// Debugging
process.env.QUIET = argr.get('quiet');
var debug = require('./debug')(process.env.QUIET === 'true');

// LiveReload
var reloader;
var rport = process.env.LIVERELOAD_PORT || argr.get('livereload-port');
rport = isNaN(rport) ? 35729 : +rport;

if(argr.get('livereload') && argr.get('livereload')[0] !== 'off') {
  var tinylr = require('tiny-lr');

  reloader = tinylr();
  reloader.listen(rport, function() {
    debug.log('LiveReload '+rport);
  });
}

// Serve
var statics;
var port = process.env.PORT || argr.get('port');
var inject = require('inject-lr-script');
var server = require('./server')({
  port: port
})
  .use(function(req, res, next) {
    inject(res, {port: rport});
    next();
  })
  .use(statics = require('./routes/statics')({
    cacheExpiration: argr.get('cache-expiration')
  }))
  .use(require('./routes/notfound')())
  .start();

// Watch
if(argr.get('watch') && argr.get('watch')[0] !== 'off') {
  require('./watch')({
    reloader: tinylr,
    statics: statics
  });
}
