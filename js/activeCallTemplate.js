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

    $('#logout-button').on('click', hangupCall);
  }
};

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
