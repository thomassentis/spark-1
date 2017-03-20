const express = require('express');
const app = express();

app.get('/', (req, res) => res.sendFile(__dirname + '/public/login.html'));
app.use(express.static('public'));
app.listen(8000, () => {});
