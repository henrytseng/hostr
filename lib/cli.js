'use strict';

// Dependencies
import { default as path } from 'node:path';
import { default as Argr } from 'argr';
import Debug from './debug.js';

// Command-line Interface
const argr = Argr()
  .useStrict(true)

  .option(['l', 'livereload'], 'Use LiveReload automatic browser refresh (default=enabled)', true)
  .option(['r', 'livereload-port'], 'WebSocket port to use for LiveReload (35729)', 35729)

  .option(['c', 'cache-expiration'], 'Cache expiration time in seconds (default=60)', 60)

  .option(['w', 'watch'], 'Use watch (default=enabled)', true)
  .option(['p', 'port'], 'HTTP port (3000)', 3000)
  .option(['q', 'quiet'], 'Quiet mode')

  .option(['h', 'help', '?'], 'Display help');

// Logging
const debug = Debug(process.env.QUIET === 'true');

/**
 * Show help
 */
function _displayHelp() {
  console.log(`Usage: ${argr.command().split(path.sep).pop()}`);

  // Build options
  let maxLine = '';
  let line;
  const instructions = [];
  argr.options().forEach(option => {
    const params = option.param.slice(0).map(p => (p.length === 1) ? `-${p}` : `--${p}`);

    line = params.join(', ');
    if (line.length > maxLine.length) maxLine = line;
    instructions.push(line);
  });

  // Add descriptions
  argr.options().forEach((option, i) => {
    const blanks = Array((maxLine.length + 3) - instructions[i].length).join(' ');
    line = ` ${instructions[i]}${blanks}${option.description}`;
    instructions[i] = line;
  });
  console.log(instructions.join("\n"));
}

// CLI Initialize
// Check arguments
try {
  argr.init(process.argv);

} catch (e) {
  console.error("Syntax error\n");
  _displayHelp();
  process.exit(1);
}

// Display help
if (argr.get('h')) {
  _displayHelp();
  process.exit();
}

// Debugging
process.env.QUIET = argr.get('quiet');

// LiveReload
let reloader;
let tinylr;
if (argr.get('livereload') && argr.get('livereload')[0] !== 'off') {
  const { default: _tinylr } = await import('tiny-lr');
  tinylr = _tinylr;
  let rport = process.env.LIVERELOAD_PORT || argr.get('livereload-port');

  reloader = tinylr();
  rport = isNaN(rport) ? 35729 : +rport;
  reloader.listen(rport, () => {
    debug.log(`LiveReload ${rport}`);
  });
}

// Serve
let statics;
const port = process.env.PORT || argr.get('port');
const { default: serverFactory } = await import('./server.js');
const { default: staticsFactory } = await import('./routes/statics.js');
const { default: notfoundFactory } = await import('./routes/notfound.js');

const server = serverFactory({
  port: port
})
  .use(statics = staticsFactory({
    cacheExpiration: argr.get('cache-expiration')
  }))
  .use(notfoundFactory())
  .start();

// Watch
if (argr.get('watch') && argr.get('watch')[0] !== 'off') {
  const { default: watchFactory } = await import('./watch.js');
  watchFactory({
    reloader: tinylr,
    statics: statics
  });
}
