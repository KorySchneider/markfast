'use strict';

const expres = require('express'),
      md     = require('markdown'),
      PORT   = 3000,
      log    = console.log,
      app    = express();

app.get('/', (req, res) => {
  res.send('Hello world');
});

app.listen(PORT, () => {
  log(`Listening on port ${PORT}...`);
});
