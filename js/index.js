const $ = require('jquery');
const SparkService = require('./sparkService');

let call;

/*
When you're redirected back from Spark's login page, it grants you a temporary
code which is then exchanged for an access token. This process is not immediate.
If you attempt to make any calls to Spark before it finishes, Spark will throw
an error.
*/
SparkService.waitForAuthentication().then(() => {
  SparkService.register().then(() => {
    $('#submit_user_email').on('click', (event) => {
      event.preventDefault();
      clearCall();

      SparkService.callUser($('#user_email').val()).then((sparkCall) => {
        call = sparkCall;
        setupCall();
      });
    });
    $('#submit_user_email').attr('disabled', false);

    $('#hangup_call').on('click', (event) => {
      if (call) {
        SparkService.hangupCall(call);
        clearCall();
      }
    });
  });
});

function setupCall() {
  call.on('connected', () => {
    $('#incoming_call').attr('src', call.remoteMediaStreamUrl);
  });
  call.on('localMediaStream:change', () => {
    $('#outgoing_call').attr('src', call.localMediaStreamUrl);
  });
  call.on('error', (error) => {
    $('#spark_message').html('Error: Spark failure: ' + error.message);
  });
}

function clearCall() {
  $('#spark_message').html('');
  $('#incoming_call').attr('src', '');
  $('#outgoing_call').attr('src', '');
}
