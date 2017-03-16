require('./env.js');
const $ = require('jquery');
const SparkService = require('./sparkService');

SparkService.register();

$('#submit_user_email').on('click', (event) => {
  event.preventDefault();

  const email = $('#user_email').val();

  SparkService.getUser(email).then((user) => {
    if (user) {
      $('#display_name').html('Calling: ' + user.displayName);
      SparkService.callUser(email);
    } else {
      $('#display_name').html('No user found');
    }
  }).catch((error) => {
    $('#display_name').html('Error: Spark failure');
  });
});