const $ = require('jquery');
const SparkService = require('./sparkService');

SparkService.register().then(() => {
  $('#submit_user_email').on('click', (event) => {
    event.preventDefault();

    SparkService.callUser($('#user_email').val()).then((sparkCall) => {
      displayCall(sparkCall);
    });
  });

  $('#user_email').on('input propertychange paste', (event) => {
    let disabled = true;
    if ($('#user_email').val().length > 0) {
      disabled = false;
    }

    $('#submit_user_email').attr('disabled', disabled);
  });
});

function displayCall(call) {
  let callViewHtml = $('#call-template').html().trim();
  let $callView = $(callViewHtml).appendTo('#overlay');
  $('#overlay').addClass('visible');

  call.on('connected', () => {
    $('#incoming_call').attr('src', call.remoteMediaStreamUrl);
  });
  call.on('localMediaStream:change', () => {
    $('#outgoing_call').attr('src', call.localMediaStreamUrl);
  });
  call.on('error', (error) => {
    $('#spark_message').html('Error: Spark failure: ' + error.message);
  });

  $('#hangup_call').on('click', (event) => {
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
