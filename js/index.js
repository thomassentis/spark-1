const $ = require('jquery');
const SparkService = require('./sparkService');

SparkService.register().then(() => {
  $('#submit-user-email').on('click', (event) => {
    event.preventDefault();

    SparkService.callUser($('#user-email').val()).then((sparkCall) => {
      displayCall(sparkCall);
    });
  });

  $('#user-email').on('input propertychange paste', () => {
    $('#submit-user-email').attr('disabled', $('#user-email').val().length === 0);
  });

  $('#logout-button').on('click', () => SparkService.logout());
  $('#logout-button').attr('disabled', false);
});

function displayCall(call) {
  let callViewHtml = $('#call-template').html().trim();
  let $callView = $(callViewHtml).appendTo('#overlay');
  $('#overlay').addClass('visible');

  call.on('connected', () => {
    $('#incoming-call').attr('src', call.remoteMediaStreamUrl);
  });
  call.on('localMediaStream:change', () => {
    $('#outgoing-call').attr('src', call.localMediaStreamUrl);
  });
  call.on('error', (error) => {
    $('#spark-message').html('Error: Spark failure: ' + error.message);
  });

  $('#hangup-call').on('click', () => {
    if (call) {
      SparkService.hangupCall(call);
      clearCall($callView);
    }
  });

  $('#logout-button').on('click', () => SparkService.hangupCall(call));
}

function clearCall($view) {
  $view.remove();
  $('#overlay').removeClass('visible');
}
