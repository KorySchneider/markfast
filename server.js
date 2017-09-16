'use strict';

const express     = require('express'),
      fileUpload  = require('express-fileupload'),
      bodyParser  = require('body-parser'),
      MongoClient = require('mongodb').MongoClient,
      ObjectId    = require('mongodb').ObjectId,
      PORT        = 3000,
      DB_URL      = 'mongodb://localhost:27017/marksite',
      app         = express(),
      md          = require('markdown-it')({
                      'html': true,
                      'breaks': true,
                      'linkify': true,
                      'typographer': true
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
  const renderHTMLStart = `\
<!doctype html>
<html>
  <head>
    <title>marksite</title>
    <meta name='viewport' content='width=device-width, initial-scale=1'/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css">
    <style>
      html, body {
        height: 100%;
        width: 100%;
        margin: 0;
      }
      body {
        color: #303030;
        background-color: #E0DDCF;
        font-family: sans-serif;
        font-size: 1.05em;
      }
      #md {
        width: 90vw;
        margin: 4vh 5vw;
      }
      #md h1 {
        text-align: center;
      }
      a {
        color: #B1CC74;
      }
      a:visited {
        color: #303030;
      }
      img {
        max-width: 90vw;
      }

      /* Desktop */
      @media screen and (min-width: 768px) {
        body {
          font-size: 1.15em;
        }
        #md {
          max-width: 800px;
          margin: 4vh auto;
        }
      }
    </style>
  </head>

  <body>
    <div id='md'>
`;

  const renderHTMLEnd = `
    </div>
  </body>
</html>`;

  let id = new ObjectId(req.params.id); // TODO this sometimes throws an error but seems to always work
  MongoClient.connect(DB_URL, (err, db) => {
    if (err == null) {
      const col = db.collection('sites');
      col.findOne({ _id: id }, {}, (err, doc) => {
        if (err == null) {
          let render = renderHTMLStart + md.render(doc.content) + renderHTMLEnd;
          res.send(render);
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
