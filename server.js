'use strict';

const express     = require('express'),
      fileUpload  = require('express-fileupload'),
      bodyParser  = require('body-parser'),
      markdown    = require('markdown').markdown,
      MongoClient = require('mongodb').MongoClient,
      ObjectId    = require('mongodb').ObjectId,
      PORT        = 3000,
      DB_URL      = 'mongodb://localhost:27017/marksite',
      app         = express();

app.use(express.static(__dirname + '/public'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  res.send('GET root');
});

app.post('/create', (req, res) => {
  MongoClient.connect(DB_URL, (err, db) => {
    if (err == null) {
      const col = db.collection('sites');
      col.insert({ content: req.files.mdFile.data.toString() }, (err, docs) => {
        let createdID = docs.insertedIds[0];
        res.send(`Created document: ${createdID}`);
      });
    } else {
      console.log(`Creation error: ${err}`);
    }

    db.close();
  });
});

app.get('/render/:id', (req, res) => {
  let id = new ObjectId(req.params.id);
  MongoClient.connect(DB_URL, (err, db) => {
    if (err == null) {
      const col = db.collection('sites');
      col.findOne({ _id: id }, {}, (err, doc) => {
        if (err == null) {
          console.log('doc' + doc);
          res.send(markdown.toHTML(doc.content));
        } else {
          console.log(`Render error: ${err}`);
          res.send('Not found :^(');
        }
      });
    } else {
      console.log(err);
    }
    db.close();
  });
});

//app.post('/create', (req, res) => {
//  MongoClient.connect(DB_URL, (err, db) => {
//    if (err == null) {
//      const col = db.collection('sites');
//      let linkName = req.body.linkName;
//      let fileContents = req.files.mdFile.data.toString();
//
//      col.insertOne({
//        name: linkName,
//        content: fileContents
//      }, (err, r) => {
//        if (err) console.log(`Creation error: ${err}`);
//      });
//    } // TODO else error
//    db.close();
//  });
//
//  res.send('created TODO redirect?');
//});

//app.get('/render/:name', (req, res) => {
//  MongoClient.connect(DB_URL, (err, db) => {
//    if (err == null) {
//      const col = db.collection('sites');
//      col.find({ name: req.params.name }).toArray((err, docs) => {
//        console.log(docs);
//      });
//      //TODO render markdown
//    }
//    db.close();
//  });
//
//  res.send('render: ' + req.params.name);
//});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
