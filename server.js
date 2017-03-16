const express = require('express');
const app = express();

app.use('/index.html', express.static('src/index.html'));
app.use('/login.html', express.static('src/login.html'));
app.use('/bundle.js', express.static('src/js/bundle.js'));
app.use('/loginBundle.js', express.static('src/js/loginBundle.js'));
app.listen(8000, () => {});
