const $ = require('jquery');
const SPARK_SERVICE = require('./sparkService');

let currentCall = null;

SPARK_SERVICE.register().then(() => {
  $('#call-video-audio').on('click', callByEmail);
  $('#call-audio-only').on('click', (event) => callByEmail(event, { video: false }));

  $('#user-email').on('input propertychange paste', () => {
    $('#call-video-audio').attr('disabled', $('#user-email').val().length === 0);
    $('#call-audio-only').attr('disabled', $('#user-email').val().length === 0);
  });

  SPARK_SERVICE.listen(displayIncomingCall);

  $('#logout-button').on('click', () => SPARK_SERVICE.logout());
  $('#logout-button').attr('disabled', false);
});

function callByEmail(event, options) {
  event.preventDefault();
  const EMAIL = $('#user-email').val();

  SPARK_SERVICE.callUser(EMAIL, options).then((sparkCall) => {
    $('#main-content').append($('#calling-template').html().trim());
    $('#callee-email').html(EMAIL);

    displayAvatarImage(EMAIL, '#callee-image');

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
  const EMAIL = call.from.person.email;

  $('#main-content').append($('#incoming-call-template').html().trim());

  $('#caller-email').html(EMAIL);
  displayAvatarImage(EMAIL, '#caller-image');

  call.on('disconnected error', incomingCallFailure);

  $('#answer-video-audio').on('click', () => {
    SPARK_SERVICE.answerCall(call).then(() => handleCall(call));
    call.off('disconnected error', incomingCallFailure);
    clearIncomingCall();
  });

  $('#answer-audio-only').on('click', () => {
    SPARK_SERVICE.answerCall(call, { video: false }).then(() => handleCall(call));
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
    currentCall.off('disconnected error', hangupCall);
    hangupCall();
  });

  $('#logout-button').on('click', () => SPARK_SERVICE.hangupCall(call));
}

function outgoingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Rejected';
  $('#calling-status').html(message).css('display', 'inline');
  $('#hangup-calling').removeClass('red').addClass('wide').text('Home');
  $('.avatar-image').addClass('failed');
}

function incomingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Cancelled';
  $('#incoming-call-status').html(message).css('display', 'inline');
  $('#answer-video-audio').css('display', 'none');
  $('#answer-audio-only').css('display', 'none');
  $('#reject').removeClass('red').addClass('wide').text('Home');
  $('.avatar-image').addClass('failed');
  $('#incoming-call-overlay h1').css('display', 'none');
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

function displayAvatarImage(email, imageId) {
  SPARK_SERVICE.getAvatarUrl(email).then((url) => {
    $(imageId).attr('src', url);
    // Allow continued loading if there is a problem or no avatar image found
  }).catch(() => {});
}
