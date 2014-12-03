'use strict';

describe('Server', function() {
  it('Should initialize without error', function() {
    var fork = require('child_process').fork;

    var server = fork('lib/server.js');
    server.kill('SIGKILL');
  });
});
