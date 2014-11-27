'use strict';

var colors = require('colors');
var express = require('express');
var morgan = require('morgan');

var app = express();

app.use(morgan('tiny'));
app.use('/', express.static(process.cwd() + '/'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(('Listening on '+port).green);
});
