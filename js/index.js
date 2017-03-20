const $ = require('jquery');
const SparkService = require('./sparkService');

var call = null;

// When you're redirected back from Spark's login page, it grants you a temporary code which is then exchanged for an access token.
// This process is not immediate. If you attempt to make any calls to Spark before it finishes, Spark will throw an error.
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
