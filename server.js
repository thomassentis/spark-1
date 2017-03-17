const express = require('express');
const app = express();

app.get('/', (req, res) => res.sendFile(__dirname + '/login.html'));
app.use('/index.html', express.static('index.html'));
app.use('/login.html', express.static('login.html'));
app.use('/js/bundle.js', express.static('js/bundle.js'));
app.use('/js/loginBundle.js', express.static('js/loginBundle.js'));
app.use('/css/main.css', express.static('css/main.css'));
app.listen(8000, () => {});
