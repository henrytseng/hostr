'use strict';

var colors = require('colors');
var express = require('express');
var morgan = require('morgan');

var app = express();

function _log(msg) {
  if(process.env.QUIET !== 'true') {
    console.log(msg);
  }
}

if(process.env.QUIET !== 'true') {
  app.use(morgan('tiny'));
}

app.use('/', express.static(process.cwd() + '/'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  _log(('Listening on '+port).green);
  process.send({
    status: 'ready'
  });
});
