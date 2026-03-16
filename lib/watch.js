'use strict';

import fs from 'node:fs';
import path from 'node:path';
import colors from 'colors';
import minimatch from 'minimatch';
import Debug from './debug.js';

const debug = Debug(process.env.QUIET === 'true');

export default (options = {}) => {
  const _reloader = options.reloader;

  // Default ignore list
  const _trackingList = [];
  let _ignoreList = [ '.hostrignore', 'node_modules', '.git' ];

  let _watch;
  let _track, _ignore, _isIgnored;

  /**
   * Instance
   */
  _watch = {

    /**
     * Track changes in a folder
     *
     * @param {String} src A path to track
     */
    track: _track = (src) => {
      // Ignore
      const relativeSrc = path.relative(process.cwd(), src);
      if(_isIgnored(relativeSrc)) return;

      // Add watch
      _trackingList.push(src);
      fs.watch(src, (action, changedSrc) => {
        debug.log(`Changed ${changedSrc}`.green);

        // Reloader
        if(_reloader) _reloader.changed(changedSrc);
      });
    },

    /**
     * Ignore a list of files
     *
     * @param  {Array} list An array of files to ignore
     */
    ignore: _ignore = (list) => {
      list.forEach(file => {
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
    isIgnored: _isIgnored = (src) => {
      for(let i=0; i<_ignoreList.length; i++) {
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
    const relativeSrc = path.relative(process.cwd(), src);
    if(_isIgnored(relativeSrc)) return;

    // Process
    fs.readdir(src, (err, files) => {
      files.forEach(filename => {
        fs.stat(src + path.sep + filename, (err, stat) => {
          if(stat && stat.isDirectory()) {
            _recurseFolder(src + path.sep + filename);
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
  }, (err, data) => {
    if(!err) {
      _ignoreList = [ '.hostrignore' ];
      _ignore((data || '').split('\n'));
    }

    _recurseFolder('.');
  });

  return _watch;
};
