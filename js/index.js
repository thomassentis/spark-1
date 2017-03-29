const $ = require('jquery');
const sparkService = require('./sparkService');
const mediaValidator = require('./mediaValidator');

let currentCall = null;

$('#logout-button').on('click', () => sparkService.logout());

sparkService.register().then(() => {
  $('#call-audio-video').on('click', callByEmail);
  $('#call-audio-only').on('click', (event) => callByEmail(event, { video: false }));

  $('#user-email').on('input propertychange paste', () => {
    if($('#user-email').val().length !== 0) {
      mediaValidator.validateAudio().then(mediaValidator.validateVideo).catch(() => {});
    } else {
      $('#call-audio-only').attr('disabled', true);
      $('#call-audio-video').attr('disabled', true);
    }
  });

  sparkService.listenForCall(displayIncomingCall);
});

function callByEmail(event, constraints) {
  event.preventDefault();
  const email = $('#user-email').val();

  sparkService.callUser(email, constraints).then((sparkCall) => {
    $('#main-content').append($('#calling-template').html().trim());
    $('#callee-email').html(email);

    displayAvatarImage(email, '#callee-image');

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
  const email = call.from.person.email;

  $('#main-content').append($('#incoming-call-template').html().trim());

  $('#caller-email').html(email);
  displayAvatarImage(email, '#caller-image');
  mediaValidator.validateAudio().then(mediaValidator.validateVideo);

  call.on('disconnected error', incomingCallFailure);

  $('#answer-audio-video').on('click', () => {
    answerCall(call);
  });

  $('#answer-audio-only').on('click', () => {
    answerCall(call, { video: false });
  });

  $('#reject').on('click', () => {
    if (call.status !== 'disconnected') {
      sparkService.rejectCall(call);
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

  $('#logout-button').on('click', () => sparkService.hangupCall(call));
}

function answerCall(call, constraints) {
  sparkService.answerCall(call, constraints).then(() => handleCall(call));
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
  $('#answer-audio-video').css('display', 'none');
  $('#answer-audio-only').css('display', 'none');
  $('#reject').removeClass('red').addClass('wide').text('Home');
  $('.avatar-image').addClass('failed');
  $('#incoming-call-overlay h1').css('display', 'none');
}

function hangupCall() {
  sparkService.hangupCall(currentCall);
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
  sparkService.getAvatarUrl(email).then((url) => {
    $(imageId).attr('src', url);
    // Allow continued loading if there is a problem or no avatar image found
  }).catch(() => {});
}
