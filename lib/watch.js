'use strict';

var fs = require('fs');
var path = require('path');
var debug = require('./debug')(process.env.QUIET === 'true');
var color = require('colors');

module.exports = function(options) {
  options = options || {};
  var _reloader = options.reloader;

  // Requires reloader
  if(!_reloader) return;

  // Internal watch asset folder
  var watchedFolders = [];
  function _watch(src) {
    watchedFolders.push(src);

    // Restart
    fs.watch(src, function(action, changedSrc) {
      if(!changedSrc.match(/^\./)) {
        var relativeSrc = (src.substr(process.cwd().length)+path.sep+changedSrc).substr(1);

        debug.log(('Changed '+relativeSrc+'').green);
        _reloader.changed(changedSrc);
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
};
