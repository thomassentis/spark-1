const $ = require('jquery');
const sparkService = require('./sparkService');

$('#login-button').on('click', () => {
  sparkService.authorize().then(() => {
    window.location.pathname = 'index.html';
  });
});
