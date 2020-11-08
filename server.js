require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
var path = require('path');


const app = express();
const port = process.env.PORT || 4000;

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