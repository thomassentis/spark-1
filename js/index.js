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
    $('#callee-email').html(EMAIL);

    SPARK_SERVICE.getAvatarUrl(EMAIL).then((url) => {
      $('#callee-image').attr('src', url);
      // Catch is a temp fix to allow us to continue past the 401 looping errors
    }).catch(() => {});

    sparkCall.on('disconnected error', outgoingCallFailure);

    sparkCall.on('connected', () => {
      $('#calling-overlay').remove();
      sparkCall.off('disconnected error', outgoingCallFailure);
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

  $('#caller-email').html(call.from.person.email);

  call.on('disconnected error', incomingCallFailure);

  $('#answer-video').on('click', () => {
    SPARK_SERVICE.answerCall(call).then(() => handleCall(call));
    call.off('disconnected error', incomingCallFailure);
    clearIncomingCall();
  });

  $('#reject').on('click', () => {
    if (call.status !== 'disconnected') {
      SPARK_SERVICE.rejectCall(call);
    }
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
  currentCall.on('disconnected error', hangupCall);

  $('#hangup-call').on('click', () => {
    hangupCall();
  });

  $('#logout-button').on('click', () => SPARK_SERVICE.hangupCall(call));
}

function outgoingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Rejected';
  $('#calling-status').html(message).css('display', 'inline');
  $('#hangup-calling').removeClass('red').addClass('wide').text('Home');
}

function incomingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Canceled';
  $('#incoming-call-status').html(message).css('display', 'inline');
  $('#answer-video').css('display', 'none');
  $('#reject').removeClass('red').addClass('wide').text('Home');
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
