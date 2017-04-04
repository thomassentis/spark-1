const $ = require('jquery');
const SparkService = require('./sparkService');

$('#login-button').on('click', () => {
  SparkService.authorize().then(() => {
    window.location.pathname = 'index.html';
  });
});
