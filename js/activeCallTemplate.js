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
    updateOutgoingVideo();

    registerCallEvents();

    $('#hangup-call').on('click', () => {
      currentCall.off('disconnected error', hangupCall);
      hangupCall();
    });

    $('#toggle-outgoing-video').on('click', toggleSendingVideo);
    $('#toggle-outgoing-audio').on('click', toggleSendingAudio);

    $('#toggle-incoming-video').on('click', toggleReceivingVideo);

    $('#logout-button').on('click', hangupCall);
  }
};

function registerCallEvents() {
  currentCall.on('remoteMediaStream:change', () => updateRemoteStream());
  currentCall.on('localMediaStream:change', () => updateLocalStream());
  currentCall.on('change:receivingVideo', () => updateIncomingVideo());
  currentCall.on('change:sendingVideo', () => updateOutgoingVideo());
  currentCall.on('remoteVideoMuted:change', () => updateIncomingVideo());

  currentCall.on('disconnected error', hangupCall);
}

function updateOutgoingVideo() {
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
  let incomingOverlay = $('#incoming-call-video-overlay');
  if(currentCall.receivingVideo && !currentCall.remoteVideoMuted) {
    incomingOverlay.hide();
  } else {
    incomingOverlay.show();
  }

  $('#toggle-incoming-video').prop('disabled', currentCall.remoteVideoMuted);

  if(currentCall.receivingVideo) {
    $('#toggle-incoming-video').removeClass('off');
  } else {
    $('#toggle-incoming-video').addClass('off');
  }
}

function toggleReceivingVideo() {
  $('#toggle-incoming-video').attr('disabled', true);
  currentCall.toggleReceivingVideo().then(() => {
    $('#toggle-incoming-video').attr('disabled', false);
  });
}

function toggleSendingVideo() {
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
