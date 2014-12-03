'use strict';

describe('Server', function() {
  it('Should initialize without error', function(done) {
    var fork = require('child_process').fork;

    var delegate = {
      handler: function() {
        server.kill('SIGKILL');
        done();
      }
    };

    var server = fork('lib/server.js');
    server.on('message', delegate.handler);
  });
});
