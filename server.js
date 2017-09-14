'use strict';

const express = require('express'),
      md      = require('markdown').markdown,
      PORT    = 3000,
      log     = console.log,
      app     = express();

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(PORT, () => {
  log(`Listening on port ${PORT}...`);
});
