'use strict';

var fork = require('child_process').fork;
var fs = require('fs');
var path = require('path');

var program = require('commander');
var colors = require('colors');
var _ = require('lodash');

var pkg = require(__dirname+'/../package.json');

// Server
var server;

// Commandline Interface
program
  .version(pkg.version)
  .option('-l, --disablelivereload', 'Disables LiveReload automatic browser refresh')
  .option('-q, --quiet', 'Quiet mode')
  .parse(process.argv);

// Debugging
var debug = require('./debug')(program.quiet);

// Start livereload
var tinylr = require('tiny-lr');
if(!program.disablelivereload) {
  var srvlr = tinylr();
  srvlr.listen(35729);
}

// Shutdown
function _shutdown() {
  if(srvlr) srvlr.close();
  if(server) server.kill('SIGKILL');
  process.exit();
}

// Exception
process.on('SIGTERM', _shutdown);
process.on('SIGINT', _shutdown);

// Internal method to start server, throttled to 1 sec
var _startServer = _.debounce(function(onReady) {
  server = fork(__dirname+'/../lib/server.js', {
    env: _.extend(process.env, {
      QUIET: program.quiet || typeof program.quiet!=='undefined'
    })
  });
  if(onReady) server.on('message', onReady);
}, 1000);

// Internal watch asset folder
var watchedFolders = [];
function _watch(src) {
  watchedFolders.push(src);

  // Restart
  fs.watch(src, function(action, changedSrc) {
    if(!changedSrc.match(/^\./)) {
      var relativeSrc = (src.substr(process.cwd().length)+path.sep+changedSrc).substr(1);
      debug.log(('Changed '+relativeSrc).blue);
      
      var onReady = function(response) {
        if(response.status === 'ready') {
          tinylr.changed(changedSrc);
        }
      };
      if(server) {
        server.kill('SIGKILL');
        server.once('close', function() {
          _startServer(onReady);
        });
        server.once('error', function(e) {
          console.log('Encountered error');
          console.log(e.stack || e);
          process.exit(2);
        });
        return;
      }

      _startServer(onReady);
    }
  });
}

// Watch recursively
function diveIntoFolder(src) {
  if(src.match(/node_modules/)) {
    return;
  }

  fs.readdir(src, function(err, files) {
    files.forEach(function(filename) {
      fs.stat(src+path.sep+filename, function(err, stat) {
        if(stat.isDirectory()) {
          diveIntoFolder(src+path.sep+filename);
        }
      });
    });
  });

  // Watch current folder
  _watch(src);
}

diveIntoFolder(process.cwd());
_startServer();
