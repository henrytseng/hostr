'use strict';

/**
 * NotFound files route
 *
 * @param {http.incomingMessage} req      A request Object
 * @param {http.ServerResponse}  res      A response Object
 * @param {Function}             callback A callback, function(err)
 */
export default (options = {}) => {
  return (req, res, next) => {
    res.writeHead(404);
    res.end();
  };
};
