'use strict';

const http = require('http');

const debug = require('./debug')(process.env.QUIET === 'true');
const Router = require('./router');

/**
 * Server
 * 
 * @param  {Object} options An options data Object
 * @return {Server}         A instance of Server
 */
module.exports = function(options) {
  options = options || {};
  let _cache = {};
  let _server;
  let _httpServer;
  let _stack = [];
  let _handle, _use;

  /**
   * Instance
   */
  _server = {

    /**
     * Handle request and generate response according to middleware stack
     *
     * @param {http.incomingMessage} req      A request Object
     * @param {http.ServerResponse}  res      A response Object
     * @param {Function}             callback A callback, function(err)
     */
    handle: _handle = function(req, res, callback) {
      const stack = _stack.slice(0);
      const execute = function(err) {
        if(err) {
          return execute();
        }

        const router = stack.shift();

        // Empty
        if(!router) {
          if(callback) callback.call(null);
          return;
        }

        // Handle
        if(router.match(req)) {
          process.nextTick(router.handle.bind(null, req, res, execute));

        // Continue
        } else {
          execute();
        }
      };

      // Start
      execute();
    },

    /**
     * Queue a middleware
     *
     * @param {String}   [path]   An optional RegEx or String to match against path
     * @param {Function} callback A callback to handle requests, function(req, res, next)
     * @return {Server}           Itself; chainable
     */
    use: _use = function(path, callback) {
      if(!callback) {
        callback = path;
        path = '/';
      }

      const router = Router(path, callback);
      _stack.push(router);

      return this;
    },

    /**
     * Close server
     */
    stop: function() {
      if(_httpServer) _httpServer.close();
    },

    /**
     * Start listening
     * 
     * @param  {http.Server} [httpServer] An optional server to use
     * @return {http.Server}              An instance of http.Server used for listening to requests
     */
    start: function(httpServer) {
      this.stop();

      const port = isNaN(options.port) ? 3000 : +options.port;
      _httpServer = httpServer || http.createServer(function(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');
        if ( req.method === 'OPTIONS' ) {
          res.writeHead(200);
          res.end();
          return;
        }
      });
      _httpServer.on('request', _handle);
      _httpServer.listen(port, function() {
        debug.log('Listening on '+port);
      });

      return _server;
    }
  };

  return _server;
};
