const $ = require('jquery');
const feedbackTemplate = require('./feedbackTemplate');
const mediaValidator = require('./mediaValidator');

let currentCall = null;

const activeCallTemplate = {
  display: (call) => {
    if (currentCall) {
      hangupCall();
    }

    currentCall = call;

    feedbackTemplate.displayFeedbackButton(currentCall);

    $('#main-content').append($('#active-call-template').html().trim());

    updateRemoteStream();
    updateLocalStream();
    // updateIncomingVideo();
    updateOutgoingVideoOverlayVisibility();

    registerCallEvents();

    $('#hangup-call').on('click', () => {
      currentCall.off('disconnected error', hangupCall);
      hangupCall();
    });

    $('#toggle-outgoing-video').on('click', toggleSendingVideo);
    $('#toggle-outgoing-audio').on('click', toggleSendingAudio);
    // $('#toggle-incoming-video').on('click', toggleReceivingVideo);
    // $('#toggle-incoming-audio').on('click', toggleReceivingAudio);
    $('#logout-button').on('click', hangupCall);

    mediaValidator.validateMedia();
  }
};

// Registers all of the events for a call - necessary to update UI and handle
// call actions appropriately
function registerCallEvents() {
  currentCall.on('remoteMediaStream:change', () => updateRemoteStream());
  currentCall.on('localMediaStream:change', () => updateLocalStream());
  // currentCall.on('change:receivingVideo', () => updateIncomingVideo());
  // currentCall.on('change:receivingAudio', () => updateIncomingAudio());
  // currentCall.on('remoteVideoMuted:change', () => updateIncomingVideo());
  // currentCall.on('remoteAudioMuted:change', () => updateIncomingAudio());
  currentCall.on('disconnected', hangupCall);
  currentCall.on('error', handleError);
}

function handleError(error) {
  console.error('call error: ', error);
}

function updateOutgoingVideoOverlayVisibility() {
  let outgoingOverlay = $('#outgoing-call-video-overlay');
  if(currentCall.sendingVideo) {
    outgoingOverlay.hide();
    $('#toggle-outgoing-video').removeClass('off');
  } else {
    outgoingOverlay.show();
    $('#toggle-outgoing-video').addClass('off');
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
  $('#toggle-incoming-video').prop('disabled', true);
  currentCall.toggleReceivingVideo().then(() => {
    $('#toggle-incoming-video').prop('disabled', false);
  });
}

function toggleReceivingAudio() {
  $('#toggle-incoming-audio').prop('disabled', true);
  currentCall.toggleReceivingAudio().then(() => {
    $('#toggle-incoming-audio').prop('disabled', false);
  });
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
  $('#incoming-call').prop('src', currentCall.remoteMediaStreamUrl);
}

function updateLocalStream() {
  $('#outgoing-call').prop('src', currentCall.localMediaStreamUrl);
}

module.exports = activeCallTemplate;
