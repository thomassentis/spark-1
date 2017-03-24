const $ = require('jquery');
const SPARK_SERVICE = require('./sparkService');

let currentCall = null;

SPARK_SERVICE.register().then(() => {
  $('#submit-user-email').on('click', callByEmail);

  $('#user-email').on('input propertychange paste', () => {
    $('#submit-user-email').attr('disabled', $('#user-email').val().length === 0);
  });

  SPARK_SERVICE.listen(displayIncomingCall);

  $('#logout-button').on('click', () => SPARK_SERVICE.logout());
  $('#logout-button').attr('disabled', false);
});

function callByEmail(event) {
  event.preventDefault();
  const EMAIL = $('#user-email').val();

  SPARK_SERVICE.callUser(EMAIL).then((sparkCall) => {
    $('#main-content').append($('#calling-template').html().trim());
    $('#callee-name').html(EMAIL);

    SPARK_SERVICE.getAvatarUrl(EMAIL).then((url) => {
      $('#callee-image').attr('src', url);
      // Catch is a temp fix to allow us to continue pass the 401 looping errors
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

function displayIncomingCall(call) {
  $('#main-content').append($('#incoming-call-template').html().trim());

  $('#caller-name').html(call.from.person.email);

  $('#answer-video').on('click', () => {
    SPARK_SERVICE.answerCall(call).then(() => handleCall(call));
    clearIncomingCall();
  });

  $('#reject').on('click', () => {
    SPARK_SERVICE.rejectCall(call);
    clearIncomingCall();
  });
}

function handleCall(call) {
  if (currentCall) {
    hangupCall();
  }

  currentCall = call;

  $('#main-content').append($('#call-template').html().trim());

  if (currentCall.remoteMediaStreamUrl) {
    displayRemoteStream();
  }
  if (currentCall.localMediaStreamUrl) {
    displayLocalStream();
  }

  currentCall.on('remoteMediaStream:change', () => {
    displayRemoteStream();
  });
  currentCall.on('localMediaStream:change', () => {
    displayLocalStream();
  });
  currentCall.on('error', (error) => {
    $('#spark-message').html('Error: Spark failure: ' + error.message);
  });

  $('#hangup-call').on('click', () => {
    hangupCall();
  });

  $('#logout-button').on('click', () => SPARK_SERVICE.hangupCall(call));
}

function hangupCall() {
  SPARK_SERVICE.hangupCall(currentCall);
  clearActiveCall();
}

function clearActiveCall() {
  $('#active-call-overlay').remove();
  currentCall = null;
}

function clearIncomingCall() {
  $('#incoming-call-overlay').remove();
}

function displayRemoteStream() {
  $('#incoming-call').attr('src', currentCall.remoteMediaStreamUrl);
}

function displayLocalStream() {
  $('#outgoing-call').attr('src', currentCall.localMediaStreamUrl);
}
