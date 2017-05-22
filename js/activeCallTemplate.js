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
    updateOutgoingVideoOverlayVisibility();

    registerCallEvents();

    $('#hangup-call').on('click', () => {
      currentCall.off('disconnected error', hangupCall);
      hangupCall();
    });

    $('#toggle-outgoing-video').on('click', toggleSendingVideo);
    $('#toggle-outgoing-audio').on('click', toggleSendingAudio);
    $('#logout-button').on('click', hangupCall);

    mediaValidator.validateMedia();
  }
};

// Registers all of the events for a call - necessary to update UI and handle
// call actions appropriately
function registerCallEvents() {
  currentCall.on('remoteMediaStream:change', () => updateRemoteStream());
  currentCall.on('localMediaStream:change', () => updateLocalStream());
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
