const express = require('express');
const app = express();

app.use('/index.html', express.static('index.html'));
app.use('/login.html', express.static('login.html'));
app.use('/js/bundle.js', express.static('js/bundle.js'));
app.use('/js/loginBundle.js', express.static('js/loginBundle.js'));
app.listen(8000, () => {});
