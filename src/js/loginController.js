const $ = require('jquery');
const SparkService = require('./sparkService');

$('#login_button').on('click', (event) => {
  SparkService.authorize().then((result) => {
    window.location.pathname = 'index.html';
  });
});