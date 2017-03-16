require('./env.js');
const $ = require('jquery');
const SparkService = require('./sparkService');

SparkService.register();

var call = null;

$('#submit_user_email').on('click', (event) => {
  event.preventDefault();

  const email = $('#user_email').val();

  SparkService.getUser(email).then((user) => {
    if (user) {
      $('#display_name').html('Calling: ' + user.displayName);
      SparkService.callUser(email).then((sparkCall) => {
        call = sparkCall;
      });
    } else {
      $('#display_name').html('No user found');
    }
  }).catch((error) => {
    $('#display_name').html('Error: Spark failure');
  });
});

$('#hangup_call').on('click', (event) => {
  if (call) {
    SparkService.hangupCall(call);
    $('#display_name').html('');
  }
});
