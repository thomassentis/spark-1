const $ = require('jquery');
const SparkService = require('./sparkService');

$('#login-button').on('click', () => {
  SparkService.authorize().then((result) => {
    window.location.pathname = 'index.html';
  });
});