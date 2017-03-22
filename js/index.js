const $ = require('jquery');
const SparkService = require('./sparkService');

let currentCall = null;

SparkService.register().then(() => {
  $('#submit-user-email').on('click', (event) => {
    event.preventDefault();

    SparkService.callUser($('#user-email').val()).then(handleCall);
  });

  $('#user-email').on('input propertychange paste', () => {
    $('#submit-user-email').attr('disabled', $('#user-email').val().length === 0);
  });

  SparkService.listen(handleCall);

  $('#logout-button').on('click', () => SparkService.logout());
  $('#logout-button').attr('disabled', false);
});

function handleCall(call) {
  if (currentCall) {
    hangupCall();
  }

  currentCall = call;

  $('#overlay').append($('#call-template').html().trim());
  $('#overlay').addClass('visible');

  call.on('remoteMediaStream:change', () => {
    $('#incoming-call').attr('src', call.remoteMediaStreamUrl);
  });
  call.on('localMediaStream:change', () => {
    $('#outgoing-call').attr('src', call.localMediaStreamUrl);
  });
  call.on('error', (error) => {
    $('#spark-message').html('Error: Spark failure: ' + error.message);
  });

  $('#hangup-call').on('click', () => {
    hangupCall();
  });

  $('#logout-button').on('click', () => SparkService.hangupCall(call));
}

function hangupCall() {
  SparkService.hangupCall(currentCall);
  clearCall();
  currentCall = null;
}

function clearCall() {
  $('#call-container').remove();
  $('#overlay').removeClass('visible');
}
