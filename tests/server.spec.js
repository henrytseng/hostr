'use strict';

const assert = require('assert');

describe('Server', () => {
  describe('#use', () => {
    it('Should add middleware with handle', (done) => {
      const Server = require('../lib/server');

      const server = Server();
      server.use('/', (req, res, next) => {
        next();
      });

      assert.ok(server);

      done();
    });
  });

  describe('#handle', () => {
    it('Should handle a request according to the middleware added', (done) => {
      const Server = require('../lib/server');

      const server = Server();
      let first = 0;
      let second = 0;

      server.use((req, res, next) => {
        first++;
        next();
      });

      server.use((req, res, next) => {
        second++;
        next();
      });

      server.handle({
        url: '/'
      }, {}, (err) => {
        assert.ok(!err);
              
        assert.equal(first, 1);
        assert.equal(second, 1);

        done();
      });

    });

    it('Should pass through when no middleware was hit', (done) => {
      done();
    });
  });
});
