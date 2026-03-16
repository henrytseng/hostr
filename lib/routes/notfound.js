'use strict';

const fs = require('fs');
const url = require('url');
const crypto = require('crypto');

const debug = require('../debug')(process.env.QUIET === 'true');

/**
 * NotFound files route
 * 
 * @param {http.incomingMessage} req      A request Object
 * @param {http.ServerResponse}  res      A response Object
 * @param {Function}             callback A callback, function(err)
 */
module.exports = (options = {}) => {
  return (req, res, next) => {
    res.writeHead(404);
    res.end();
  };
};
