'use strict';

var assert = require('assert');

describe('Server', function() {
  describe('#use', function() {
    it('Should add middleware with handle', function(done) {
      var Server = require('../lib/server');

      var server = Server();
      server.use('/', function(req, res, next) {
        next();
      });

      assert.ok(server);

      done();
    });
  });

  describe('#handle', function() {
    it('Should handle a request according to the middleware added', function(done) {
      var Server = require('../lib/server');

      var server = Server();
      var first = 0;
      var second = 0;

      server.use(function(req, res, next) {
        first++;
        next();
      });

      server.use(function(req, res, next) {
        second++;
        next();
      });

      server.handle({
        url: '/'
      }, {}, function(err) {
        assert.ok(!err);
              
        assert.equal(first, 1);
        assert.equal(second, 1);

        done();
      });

    });

    it('Should pass through when no middleware was hit', function(done) {
      done();
    });
  });
});
