'use strict';

var colors = require('colors');
var express = require('express');
var morgan = require('morgan');

var debug = require('./debug')(process.env.QUIET === 'true');

var app = express();

if(process.env.QUIET !== 'true') {
  app.use(morgan('tiny'));
}

app.use('/', express.static(process.cwd() + '/'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  debug.log(('Listening on '+port).green);
  process.send({
    status: 'ready'
  });
});
