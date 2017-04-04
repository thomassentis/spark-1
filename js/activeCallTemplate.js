const $ = require('jquery');
const feedback = require('./feedback');

let currentCall = null;

const activeCallTemplate = {
  display: (call) => {
    if (currentCall) {
      hangupCall();
    }

    currentCall = call;

    feedback.displayFeedbackButton(currentCall);

    $('#main-content').append($('#call-template').html().trim());

    updateRemoteStream();
    updateLocalStream();
    updateIncomingVideo();
    updateOutgoingVideoOverlayVisibility();

    registerCallEvents();

    $('#hangup-call').on('click', () => {
      currentCall.off('disconnected error', hangupCall);
      hangupCall();
    });

    $('#toggle-outgoing-video').on('click', toggleSendingVideo);
    $('#toggle-outgoing-audio').on('click', toggleSendingAudio);
    $('#toggle-incoming-video').on('click', toggleReceivingVideo);
    $('#toggle-incoming-audio').on('click', toggleReceivingAudio);
    $('#logout-button').on('click', hangupCall);
  }
};

function registerCallEvents() {
  currentCall.on('remoteMediaStream:change', () => updateRemoteStream());
  currentCall.on('localMediaStream:change', () => updateLocalStream());
  currentCall.on('change:receivingVideo', () => updateIncomingVideo());
  currentCall.on('change:receivingAudio', () => updateIncomingAudio());
  currentCall.on('remoteVideoMuted:change', () => updateIncomingVideo());
  currentCall.on('remoteAudioMuted:change', () => updateIncomingAudio());
  currentCall.on('disconnected', hangupCall);
  currentCall.on('error', handleError);
}

function handleError(error) {
  console.error('call error: ', error);
}

function updateOutgoingVideoOverlayVisibility() {
  let outgoingOverlay = $('#outgoing-call-video-overlay');
  if (currentCall.sendingVideo) {
    $('#toggle-outgoing-video').removeClass('off');
    outgoingOverlay.hide();
  } else {
    $('#toggle-outgoing-video').addClass('off');
    outgoingOverlay.show();
  }
}

function updateIncomingVideo() {
  updateIncomingVideoOverlayVisibility();
  updateIncomingVideoButton();
}

function updateIncomingVideoOverlayVisibility() {
  let incomingOverlay = $('#incoming-call-video-overlay');
  if(currentCall.receivingVideo && !currentCall.remoteVideoMuted) {
    incomingOverlay.hide();
  } else {
    incomingOverlay.show();
  }
}

function updateIncomingVideoButton() {
  $('#toggle-incoming-video').prop('disabled', currentCall.remoteVideoMuted);
  if(currentCall.receivingVideo) {
    $('#toggle-incoming-video').removeClass('off');
  } else {
    $('#toggle-incoming-video').addClass('off');
  }
}

function updateIncomingAudio() {
  $('#toggle-incoming-audio').prop('disabled', currentCall.remoteAudioMuted);
  if(currentCall.receivingAudio) {
    $('#toggle-incoming-audio').removeClass('off');
  } else {
    $('#toggle-incoming-audio').addClass('off');
  }
}

function toggleReceivingVideo() {
  $('#toggle-incoming-video').attr('disabled', true);
  currentCall.toggleReceivingVideo().then(() => {
    $('#toggle-incoming-video').attr('disabled', false);
  });
}

function toggleReceivingAudio() {
  currentCall.toggleReceivingAudio();
}

function toggleSendingVideo() {
  currentCall.toggleSendingVideo().then(() => {
    updateLocalStream();
    updateOutgoingVideoOverlayVisibility();
  });
}

function toggleSendingAudio() {
  $('#toggle-outgoing-audio').toggleClass('off');
  currentCall.toggleSendingAudio();
}

function hangupCall() {
  currentCall.hangup();
  clearTemplate();
}

function clearTemplate() {
  currentCall = null;
  $('#active-call-overlay').remove();
}

function updateRemoteStream() {
  $('#incoming-call').attr('src', currentCall.remoteMediaStreamUrl);
}

function updateLocalStream() {
  $('#outgoing-call').attr('src', currentCall.localMediaStreamUrl);
}

module.exports = activeCallTemplate;
