'use strict';

var assert = require('assert');

describe('Router', function() {
  describe('#match', function() {
    it('Should match routes exactly with same String routes', function(done) {
      var Router = require('../lib/router');

      assert.ok(Router('/').match({
        url: '/'
      }));

      assert.ok(Router('/foo/bar').match({
        url: '/foo/bar'
      }));
      
      assert.ok(Router('/foo').match({
        url: '/foo/quox'
      }));
      
      assert.ok(Router('/ipsum').match({
        url: '/ipsum'
      }));

      done();
    });

    it('Should not match routes without same String routes', function(done) {
      var Router = require('../lib/router');

      assert.ok(!Router('/foo/bar/1').match({
        url: '/foo/bar/2'
      }));
      
      assert.ok(!Router('/sed/ut').match({
        url: '/sed'
      }));
      
      assert.ok(!Router('/ipsum').match({
        url: '/lorem/ipsum'
      }));

      done();
    });

    it('Should match with variables', function(done) {
      var Router = require('../lib/router');

      assert.ok(Router('/foo/bar').match({
        url: '/foo/bar'
      }));
      
      assert.ok(Router('/foo/quox').match({
        url: '/foo/quox'
      }));

      done();
    });

  });
});
