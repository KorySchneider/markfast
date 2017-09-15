'use strict';

const express     = require('express'),
      fileUpload  = require('express-fileupload'),
      bodyParser  = require('body-parser'),
      markdown    = require('markdown').markdown,
      MongoClient = require('mongodb').MongoClient,
      PORT        = 3000,
      DB_PORT     = 27017,
      databaseURL = `mongodb://localhost:${DB_PORT}/`,
      app         = express();

app.use(express.static(__dirname + '/public'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('GET root');
});

app.post('/create', (req, res) => {
  MongoClient.connect(databaseURL, (err, db) => {
    if (err == null) {
      const col = db.collection('sites');
      let linkName = req.body.linkName;
      let fileContents = req.files.mdFile.data.toString();

      col.insertOne({
        name: linkName,
        content: fileContents
      }, (err, r) => {
        if (err) console.log(`Creation error: ${err}`);
      });
    } // TODO else error
    db.close();
  });

  res.send('created TODO redirect?');
});

app.get('/render/:name', (req, res) => {
  MongoClient.connect(databaseURL, (err, db) => {
    if (err == null) {
      const col = db.collection('sites');
      col.find({ name: req.params.name }).toArray((err, docs) => {
        console.log(docs);
      });
      //TODO render markdown
    }
    db.close();
  });

  res.send('render: ' + req.params.name);
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
