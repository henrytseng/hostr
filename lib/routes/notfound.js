'use strict';

var fs = require('fs');
var url = require('url');
var crypto = require('crypto');

var debug = require('../debug')(process.env.QUIET === 'true');

/**
 * NotFound files route
 * 
 * @param {http.incomingMessage} req      A request Object
 * @param {http.ServerResponse}  res      A response Object
 * @param {Function}             callback A callback, function(err)
 */
module.exports = function(options) {
  options = options || {};

  return function(req, res, next) {
    res.writeHead(404);
    res.end();
  };
};
