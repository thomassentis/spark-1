const express = require('express');
const app = express();

const port = 8000;

app.get('/', (req, res) => res.sendFile(__dirname + '/public/login.html'));
app.use(express.static('public'));
app.listen(port, () => {});

console.log(`Server started on port ${port}...`);