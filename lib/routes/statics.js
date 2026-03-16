'use strict';

const fs = require('fs');
const url = require('url');
const crypto = require('crypto');
const mime = require('mime-types');

const debug = require('../debug')(process.env.QUIET === 'true');

/**
 * Static files route
 *
 * @param {http.incomingMessage} req      A request Object
 * @param {http.ServerResponse}  res      A response Object
 * @param {Function}             callback A callback, function(err)
 */
module.exports = (options = {}) => {
  let _seed = Math.random();

  // Expiration time (sec)
  const _expirationTime = options.cacheExpiration || 60;

  const _handler = (req, res, next) => {
    const resource = url.parse(req.url);
    let resourcePathname = resource.pathname || '/';
    resourcePathname = resourcePathname.replace(/\/\.\./, "").replace(/\.\.\//, "");
    let filePath = process.cwd() + resourcePathname;

    if(filePath[filePath.length-1] === '/') filePath += 'index.html';

    const startTime = process.hrtime();
    fs.stat(filePath, (err, stat) => {
      if(err) {
        return next(err);
      }

      // ETag hash
      const uniqueHash = crypto.createHash('md5').update(Buffer.from([
        _seed,
        filePath,
        (stat.mtime && stat.mtime.getTime())
      ].join(''))).digest('hex');
      const eTag = `W/"${uniqueHash}"`;

      // Use cache
      const headers = req.headers || {};
      const matchETag = headers['if-none-match'] === eTag;
      const matchExpiration = ((new Date(headers['if-modified-since'])).getTime() - Date.now()) >= 0;

      res.setHeader('ETag', eTag);

      if(matchExpiration && matchETag) {
        res.writeHead(304);
        res.end();
        return;
      }

      res.setHeader('Last-Modified', new Date(Date.now() + _expirationTime * 1000));
      res.setHeader('Cache-Control', `max-age=${_expirationTime}`);

      // Interpret mime types
      res.setHeader('Content-Type', mime.lookup(filePath));

      const readStream = fs.createReadStream(filePath);
      readStream.on('open', () => {
        readStream.pipe(res);
      });

      readStream.on('error', (err) => {
        if(err && err.code === 'ENOENT') {
          return next();

        } else {
          res.writeHead(500);
          res.end();
        }
      });

    });

    // Log request
    res.on('finish', () => {
      const deltaTime = process.hrtime(startTime);

      debug.log([
        res.statusCode,
        req.method,
        req.url,
        `${Math.ceil((deltaTime[0] * 1e9 + deltaTime[1]) / 1e6)}ms`
      ].join(' '));
    });

  };

  /**
   * Reset seed
   */
  _handler.reset = () => {
    _seed = Math.random();
  };

  return _handler;
};
