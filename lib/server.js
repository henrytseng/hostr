'use strict';

var colors = require('colors');
var express = require('express');

var app = express();

app.use('/', express.static(process.cwd() + '/'));

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log(('Listening on '+port).green);
});
