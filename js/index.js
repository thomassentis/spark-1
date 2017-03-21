const $ = require('jquery');
const SparkService = require('./sparkService');

SparkService.register().then(() => {
  $('#submit-user-email').on('click', (event) => {
    event.preventDefault();

    SparkService.callUser($('#user-email').val()).then((sparkCall) => {
      displayCall(sparkCall);
    });
  });

  $('#user-email').on('input propertychange paste', (event) => {
    let disabled = true;
    if ($('#user-email').val().length > 0) {
      disabled = false;
    }

    $('#submit-user-email').attr('disabled', disabled);
  });
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

  $('#hangup-call').on('click', (event) => {
    if (call) {
      SparkService.hangupCall(call);
      clearCall($callView);
    }
  });
}

function clearCall($view) {
  $view.remove();
  $('#overlay').removeClass('visible');
}
