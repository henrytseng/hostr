'use strict';

var fs = require('fs');
var path = require('path');
var colors = require('colors');
var minimatch = require('minimatch');

var debug = require('./debug')(process.env.QUIET === 'true');

module.exports = function(options) {
  options = options || {};
  var _reloader = options.reloader;

  // Default ignore list
  var _trackingList = [];
  var _ignoreList = [ '.hostrignore', 'node_modules', '.git' ];

  var _watch;
  var _track, _ignore, _isIgnored;

  /**
   * Instance
   */
  _watch = {

    /**
     * Track changes in a folder
     *
     * @param {String} src A path to track
     */
    track: _track = function (src) {
      // Ignore
      var relativeSrc = path.relative(process.cwd(), src);
      if(_isIgnored(relativeSrc)) return;

      // Add watch
      _trackingList.push(src);
      fs.watch(src, function(action, changedSrc) {
        debug.log(('Changed '+changedSrc+'').green);

        // Reloader
        if(_reloader) _reloader.changed(changedSrc);
      });
    },

    /**
     * Ignore a list of files
     * 
     * @param  {Array} list An array of files to ignore
     */
    ignore: _ignore = function(list) {
      list.forEach(function(file) {
        // Remove trailing comment
        if(file.indexOf('#') !== -1) {
          file = file.substr(0, file.indexOf('#'));
        }

        // Remove trailing spaces
        file = file.replace(/[ \t]+$/, '');

        if(file !== '') {
          _ignoreList.push(file);
        }
      });
    },

    /**
     * Check if should be ignored
     */
    isIgnored: _isIgnored = function(src) {
      for(var i=0; i<_ignoreList.length; i++) {
        if(minimatch(src, _ignoreList[i])) {
          return true;
        }
      }
      return false;
    }
  };

  /**
   * Internal method to watch folders recursively
   * 
   * @param  {String} src A path to start from
   */
  function _recurseFolder(src) {
    // Ignore
    var relativeSrc = path.relative(process.cwd(), src);
    if(_isIgnored(relativeSrc)) return;

    // Process
    fs.readdir(src, function(err, files) {
      files.forEach(function(filename) {
        fs.stat(src+path.sep+filename, function(err, stat) {
          if(stat && stat.isDirectory()) {
            _recurseFolder(src+path.sep+filename);
          }
        });
      });
    });

    // Watch current folder
    _track(src);
  }

  // Load ignore file and append without inclusion of node_modules
  fs.readFile(path.resolve('.hostrignore'), {
    encoding: 'utf8'
  }, function(err, data) {
    if(!err) {
      _ignoreList = [ '.hostrignore' ];
      _ignore((data || '').split('\n'));
    }

    _recurseFolder('.');
  });

  return _watch;
};
