const $ = require('jquery');

// This lookup dictionary is used to contain all of the various parameters and
// information for the different types of calls that can occur.
const dict = {
  audioOutgoing: {
    mediaType: { audio: true, video: false },
    enableFunction: enableCallButtons,
    enableIds: ['call-audio-only'],
    disableIds: ['call-audio-only', 'call-audio-video'],
    errorFunction: getAudioErrorMessage,
    successFunction: getAudioSuccessMessage
  },
  videoOutgoing: {
    mediaType: { audio: false, video: true },
    enableFunction: enableCallButtons,
    enableIds: ['call-audio-video', 'toggle-outgoing-video'],
    disableIds: ['call-audio-video', 'toggle-outgoing-video'],
    errorFunction: getVideoErrorMessage,
    successFunction: getVideoSuccessMessage
  },
  audioIncoming: {
    mediaType: { audio: true, video: false },
    enableFunction: enableButtons,
    enableIds: ['answer-audio-only'],
    disableIds: ['answer-audio-only', 'answer-audio-video'],
    errorFunction: getAudioErrorMessage,
    successFunction: getAudioSuccessMessage
  },
  videoIncoming: {
    mediaType: { audio: false, video: true },
    enableFunction: enableButtons,
    enableIds: ['answer-audio-video'],
    disableIds: ['answer-audio-video'],
    errorFunction: getVideoErrorMessage,
    successFunction: getVideoSuccessMessage
  }
};

// The mediaValidator is used in order to check for device availability and
// permissions (specifically for webcam and microphone).
const mediaValidator = {
  validateMedia: () => {
    validateAMedia(dict.audioOutgoing).then(() => validateAMedia(dict.videoOutgoing)).catch(() => {});
    validateAMedia(dict.audioIncoming).then(() => validateAMedia(dict.videoIncoming)).catch(() => {});
  }
};

function validateAMedia(options) {
  return navigator.mediaDevices.getUserMedia(options.mediaType).then(() => {
    options.enableFunction(options.enableIds, options.successFunction());
    return Promise.resolve();
  }).catch((error) => {
    return disableButtons(options.disableIds, options.errorFunction(error));
  });
}

function disableButtons(ids, error) {
  ids.forEach((id) => disableButton(id, error));
  return Promise.reject();
}

function getAudioErrorMessage(error) {
  return error.name === 'NotFoundError' ? 'No microphone found' : 'Requires microphone permission';
}

function getAudioSuccessMessage() {
  return 'Call with audio only';
}

function getVideoErrorMessage(error) {
  return error.name === 'NotFoundError' ? 'No camera found' : 'Requires camera permission';
}

function getVideoSuccessMessage() {
  return 'Call with video and audio';
}

function enableCallButtons(ids, message) {
  ids.forEach((id) => {
    if ($('#user-email').val().length === 0) {
      $(`#${id} > .tooltip-message`).html('Email required');
      return $(`#${id}`).prop('disabled', true);
    }
    enableButton(id, message);
  });
}

function enableButtons(ids, message) {
  ids.forEach(enableButton(message));
}

function enableButton(id, message) {
  const buttonElement = $(`#${id}`);
  buttonElement.prop('disabled', false).removeClass('unavailable');
  $(`#${id}:not(.toggle) > .tooltip-message`).html(message);
}

function disableButton(id, message) {
  const buttonElement = $(`#${id}`);
  const messageElement = $(`#${id} > .tooltip-message`);
  buttonElement.prop('disabled', true).addClass('unavailable');
  messageElement.html(message);
}

module.exports = mediaValidator;
