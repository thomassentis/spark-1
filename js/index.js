const $ = require('jquery');
const SparkService = require('./sparkService');

var call = null;

SparkService.waitForAuthentication().then(() => {
  SparkService.register().then(() => {
    $('#submit_user_email').on('click', (event) => {
      event.preventDefault();
      clearMessage();

      SparkService.callUser($('#user_email').val()).then((sparkCall) => {
        call = sparkCall;
        call.on('error', (error) => {
          $('#spark_message').html('Error: Spark failure: ' + error.message);
        });
      });
    });
    $('#submit_user_email').attr('disabled', false);

    $('#hangup_call').on('click', (event) => {
      if (call) {
        SparkService.hangupCall(call);
        clearMessage();
      }
    });
  });
});

function clearMessage() {
  $('#spark_message').html('');
}
