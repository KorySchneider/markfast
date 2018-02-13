'use strict';

const https       = require('https'),
      helmet      = require('helmet'),
      express     = require('express'),
      nunjucks    = require('nunjucks'),
      fileUpload  = require('express-fileupload'),
      bodyParser  = require('body-parser'),
      fs          = require('fs'),
      MongoClient = require('mongodb').MongoClient,
      ObjectId    = require('mongodb').ObjectId,
      HOSTNAME    = '165.227.11.100',
      PORT        = 80,
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
                    .use(require('markdown-it-deflist'))
                    .use(require('markdown-it-mark'))
                    .use(require('markdown-it-ins'))
                    .use(require('markdown-it-katex'));

app.use(express.static(__dirname + '/public'));
app.use(helmet());
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
  let id = new ObjectId(req.params.id);
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

app.listen(PORT, HOSTNAME, () => {
  console.log(`Listening on port ${PORT}...`);
});

https.createServer({
  cert: fs.readFileSync(__dirname + '/https/cert.pem'),
  key: fs.readFileSync(__dirname + '/https/key.pem')
}, app).listen(443);
