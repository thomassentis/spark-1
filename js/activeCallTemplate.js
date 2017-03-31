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

    let overlay = $('#outgoing-call-overlay');
    currentCall.sendingVideo ? overlay.hide() : overlay.show();

    $('#toggle-outgoing-video').on('click', () => {
      $('#toggle-outgoing-video').toggleClass('off');
      toggleSendingVideo();
    });

    $('#toggle-outgoing-audio').on('click', () => {
      $('#toggle-outgoing-audio').toggleClass('off');
      currentCall.toggleSendingAudio();
    });

    $('#logout-button').on('click', hangupCall);
  }
};

function toggleSendingVideo() {
  let overlay = $('#outgoing-call-overlay');
  currentCall.sendingVideo ? overlay.show() : overlay.hide();

  currentCall.toggleSendingVideo().then(() => {
    updateLocalStream();
  });
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
