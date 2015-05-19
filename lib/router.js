'use strict';

var debug = require('./debug')(process.env.QUIET === 'true');

/**
 * Router
 * 
 * @param  {String} path    A RegEx or String to match router to
 * @param  {Object} handler A callback, function(req, res, next)
 * @return {Router}         A instance of Router
 */
module.exports = function(path, handler) {

  /**
   * Instance
   */
  return {

    /**
     * Check if the route matches
     *
     * @return {Boolean} True if the URL matches and false otherwise
     */
    match: function(req) {
      if(!req || !req.url) return false;

      if(typeof(path) === 'string') {
        return (req.url).match(path) && ((req.url).match(path).index === 0);

      // RegExp
      } else {
        return (req.url).match(path) !== null;
      }
    },

    /**
     * Handle this route execution
     */
    handle: handler
  };
};
