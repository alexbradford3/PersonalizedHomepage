require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
var path = require('path');
var wwwhisper = require('connect-wwwhisper');


// // Alternatively, if you don't want wwwhisper to insert
// // a logout iframe into HTML responses use.
// app.use(wwwhisper(false));



const app = express();
const port = process.env.PORT || 4000;

// app holds a reference to express or connect framework, it
// may be named differently in your source file.
app.use(wwwhisper());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

app.set('view engine', 'ejs');

const apis = require('./api');
app.use("/api", apis);
app.use("/public", express.static('./public/'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.get('/about', (req, res) => {
    res.render('pages/about');
});

app.listen(port, () => console.log(`Listening on port ${port}`));