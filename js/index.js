const $ = require('jquery');
const SparkService = require('./sparkService');

let call;

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
