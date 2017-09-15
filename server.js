'use strict';

const express    = require('express'),
      fileUpload = require('express-fileupload'),
      markdown   = require('markdown').markdown,
      PORT       = 3000,
      log        = console.log,
      app        = express();

app.use(express.static(__dirname + '/public'));
app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('GET root');
});

app.post('/create', (req, res) => {
  res.send(req.files['md-file'].data.toString());
});

app.get('/render/:name', (req, res) => {
  res.send('render: ' + req.params.name);
});

app.listen(PORT, () => {
  log(`Listening on port ${PORT}...`);
});
