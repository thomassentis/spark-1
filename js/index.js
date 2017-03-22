const $ = require('jquery');
const SparkService = require('./sparkService');

let currentCall = null;

SparkService.register().then(() => {
  $('#submit-user-email').on('click', (event) => {
    callByEmail(event);
  });

  $('#user-email').on('input propertychange paste', () => {
    $('#submit-user-email').attr('disabled', $('#user-email').val().length === 0);
  });

  SparkService.listen(handleCall);

  $('#logout-button').on('click', () => SparkService.logout());
  $('#logout-button').attr('disabled', false);
});

function callByEmail(event) {
  event.preventDefault();
  const email = $('#user-email').val();

  SparkService.callUser(email).then((sparkCall) => {
    $('#main-content').append($('#calling-template').html().trim());

    $('#overlay').addClass('visible');
    $('#callee-name').html(email);

    SparkService.getAvatarUrl(email).then((url) => {
      $('#callee-image').attr('src', url);
    }).catch(() => {});

    sparkCall.on('connected', () => {
      $('#calling-overlay').remove();
      handleCall(sparkCall);
    });

    $('#hangup-calling').on('click', () => {
      sparkCall.hangup();
      $('#calling-overlay').remove();
    });
  });
}

function handleCall(call) {
  if (currentCall) {
    hangupCall();
  }

  currentCall = call;

  $('#main-content').append($('#call-template').html().trim());

  if(call.remoteMediaStreamUrl) {
    $('#incoming-call').attr('src', call.remoteMediaStreamUrl);
  }
  if(call.localMediaStreamUrl) {
    $('#outgoing-call').attr('src', call.localMediaStreamUrl);
  }
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
  $('#active-call-overlay').remove();
  currentCall = null;
}
