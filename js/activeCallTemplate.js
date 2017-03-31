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

    initializeVideoOverlays();

    $('#toggle-outgoing-video').on('click', toggleSendingVideo);
    $('#toggle-outgoing-audio').on('click', toggleSendingAudio);

    $('#toggle-incoming-video').on('click', toggleReceivingVideo);

    $('#logout-button').on('click', hangupCall);
  }
};

function initializeVideoOverlays() {
  let outgoingOverlay = $('#outgoing-call-video-overlay');
  if (currentCall.sendingVideo) {
    outgoingOverlay.hide();
  } else {
    $('#toggle-outgoing-video').addClass('off');
    outgoingOverlay.show();
  }

  let incomingOverlay = $('#incoming-call-video-overlay');
  if (currentCall.receivingVideo) {
    incomingOverlay.hide();
  } else {
    $('#toggle-incoming-video').addClass('off');
    incomingOverlay.show();
  }
}

function toggleReceivingVideo() {
  let overlay = $('#incoming-call-video-overlay');
  currentCall.receivingVideo ? overlay.show() : overlay.hide();
  $('#toggle-incoming-video').toggleClass('off');

  currentCall.toggleReceivingVideo().then(() => {
    updateRemoteStream();
  });
}

function toggleSendingVideo() {
  let overlay = $('#outgoing-call-video-overlay');
  currentCall.sendingVideo ? overlay.show() : overlay.hide();
  $('#toggle-outgoing-video').toggleClass('off');

  currentCall.toggleSendingVideo().then(() => {
    updateLocalStream();
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
