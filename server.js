'use strict';

const express     = require('express'),
      nunjucks    = require('nunjucks'),
      fileUpload  = require('express-fileupload'),
      bodyParser  = require('body-parser'),
      MongoClient = require('mongodb').MongoClient,
      ObjectId    = require('mongodb').ObjectId,
      PORT        = 3000,
      DB_URL      = 'mongodb://localhost:27017/markfast',
      app         = express(),
      hljs        = require('highlight.js'),
      md          = require('markdown-it')({
                      'html': true,
                      'breaks': true,
                      'linkify': true,
                      'typographer': true,
                      'highlight': (str, lang) => {
                        if (lang && hljs.getLanguage(lang)) {
                          try {
                            return hljs.highlight(lang, str).value;
                          } catch(__) {}
                        }
                        return '';
                      }
                    })
                    .use(require('markdown-it-sub'))
                    .use(require('markdown-it-sup'))
                    .use(require('markdown-it-footnote'))
                    .use(require('markdown-it-abbr'))
                    .use(require('markdown-it-emoji'))
                    .use(require('markdown-it-katex'));

app.use(express.static(__dirname + '/public'));
app.use(fileUpload());
app.use(bodyParser.urlencoded({ extended: false }));

nunjucks.configure('public', { express: app });

app.get('/', (req, res) => {
  res.send('GET root');
});

app.post('/create', (req, res) => {
  if (req.files.mdFile == undefined) {
    res.redirect('/');
    return;
  }
  MongoClient.connect(DB_URL, (err, db) => {
    if (err == null) {
      const col = db.collection('sites');
      col.insert({ content: req.files.mdFile.data.toString() }, (err, docs) => {
        if (err == null) {
          let createdID = docs.insertedIds[0];
          res.redirect(`/render/${createdID}`);
        } else
          console.log(`Creation error: ${err}`);
      });
    } else {
      console.log(`Connection error: ${err}`);
    }

    db.close();
  });
});

app.get('/render/:id', (req, res) => {
  let id = new ObjectId(req.params.id); // TODO this throws an error but works
  MongoClient.connect(DB_URL, (err, db) => {
    if (err == null) {
      const col = db.collection('sites');
      col.findOne({ _id: id }, {}, (err, doc) => {
        if (err == null) {
          res.send(nunjucks.render('render.html', {
            markdown: md.render(doc.content)
          }));
        } else {
          console.log(`Render error: ${err}`);
          res.send('Not found :^(');
        }
      });
    } else {
      console.log(`Connection error: ${err}`);
    }
    db.close();
  });
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}...`);
});
