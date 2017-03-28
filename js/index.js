const $ = require('jquery');
const SPARK_SERVICE = require('./sparkService');

let currentCall = null;

SPARK_SERVICE.register().then(() => {
  $('#call-video-audio').on('click', callByEmail);
  $('#call-audio-only').on('click', (event) => callByEmail(event, { video: false }));

  $('#user-email').on('input propertychange paste', () => {
    validateAudioAvailable().then(validateVideoAvailable).catch(() => {});
  });

  SPARK_SERVICE.listen(displayIncomingCall);

  $('#logout-button').on('click', () => SPARK_SERVICE.logout());
  $('#logout-button').attr('disabled', false);
});

function validateAudioAvailable() {
  return navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(() => {
    enableCallButton('call-audio-only');
    $('#call-video-audio > .invalid-call-message').remove();
    return Promise.resolve();
  }, (error) => {
    if ($('#call-audio-only > .invalid-call-message').length === 0) {
      let errorMessage = error.name === 'NotFoundError' ? 'No microphone found' : 'Call requires audio permission';
      disableCallButton('call-audio-only', errorMessage);
      disableCallButton('call-video-audio', errorMessage);
    }
    return Promise.reject(error);
  });
}

function validateVideoAvailable() {
  return navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then(() => {
    enableCallButton('call-video-audio');
    return Promise.resolve();
  }, (error) => {
    if ($('#call-video-audio > .invalid-call-message').length === 0) {
      let errorMessage = error.name === 'NotFoundError' ? 'No camera found' : 'Call requires video permission';
      disableCallButton('call-video-audio', errorMessage);
    }
    return Promise.reject(error);
  });
}

function enableCallButton(id){
  $('#' + id).attr('disabled', $('#user-email').val().length === 0);
  $('#' + id).removeClass('disabled');
  $('#' + id + '> .invalid-call-message').remove();
}

function disableCallButton(id, message) {
  $('#' + id).attr('disabled', true).addClass('disabled');
  $('#' + id).append('<span class="invalid-call-message">' + message + '</span>');
}

function callByEmail(event, constraints) {
  event.preventDefault();
  const EMAIL = $('#user-email').val();

  SPARK_SERVICE.callUser(EMAIL, constraints).then((sparkCall) => {
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
    answerCall(call);
  });

  $('#answer-audio-only').on('click', () => {
    answerCall(call, { video: false });
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
    updateRemoteStream();
  }
  if (currentCall.localMediaStreamUrl) {
    updateLocalStream();
  }

  currentCall.on('remoteMediaStream:change', () => updateRemoteStream());
  currentCall.on('localMediaStream:change', () => updateLocalStream());
  currentCall.on('disconnected error', hangupCall);

  $('#hangup-call').on('click', () => {
    currentCall.off('disconnected error', hangupCall);
    hangupCall();
  });

  $('#logout-button').on('click', () => SPARK_SERVICE.hangupCall(call));
}

function answerCall(call, constraints) {
  SPARK_SERVICE.answerCall(call, constraints).then(() => handleCall(call));
  call.off('disconnected error', incomingCallFailure);
  clearIncomingCall();
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

function updateRemoteStream() {
  $('#incoming-call').attr('src', currentCall.remoteMediaStreamUrl);
}

function updateLocalStream() {
  $('#outgoing-call').attr('src', currentCall.localMediaStreamUrl);
}

function displayAvatarImage(email, imageId) {
  SPARK_SERVICE.getAvatarUrl(email).then((url) => {
    $(imageId).attr('src', url);
    // Allow continued loading if there is a problem or no avatar image found
  }).catch(() => {});
}
