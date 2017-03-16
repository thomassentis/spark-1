const express = require('express');
const app = express();

app.use('/index.html', express.static('src/index.html'));
app.use('/bundle.js', express.static('src/js/bundle.js'));
app.listen(8000, () => {});
