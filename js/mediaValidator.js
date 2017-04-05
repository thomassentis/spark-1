const $ = require('jquery');

// This lookup dictionary is used to contain all of the various parameters and
// information for the different types of calls that can occur.
const dict = {
  audioOutgoing: {
    mediaType: { audio: true, video: false },
    enableFunction: enableCallButtons,
    enableIds: ['call-audio-only'],
    disableIds: ['call-audio-only', 'call-audio-video'],
    errorFunction: getAudioErrorMessage
  },
  videoOutgoing: {
    mediaType: { audio: false, video: true },
    enableFunction: enableCallButtons,
    enableIds: ['call-audio-video', 'toggle-outgoing-video'],
    disableIds: ['call-audio-video', 'toggle-outgoing-video'],
    errorFunction: getVideoErrorMessage
  },
  audioIncoming: {
    mediaType: { audio: true, video: false },
    enableFunction: enableButtons,
    enableIds: ['answer-audio-only'],
    disableIds: ['answer-audio-only', 'answer-audio-video'],
    errorFunction: getAudioErrorMessage
  },
  videoIncoming: {
    mediaType: { audio: false, video: true },
    enableFunction: enableButtons,
    enableIds: ['answer-audio-video'],
    disableIds: ['answer-audio-video'],
    errorFunction: getVideoErrorMessage
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
    options.enableFunction(options.enableIds);
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

function getVideoErrorMessage(error) {
  return error.name === 'NotFoundError' ? 'No camera found' : 'Requires camera permission';
}

function enableCallButtons(ids) {
  ids.forEach((id) => {
    if($('#user-email').val().length === 0) return $(`#${id}`).prop('disabled', true);
    enableButton(id);
  });
}

function enableButtons(ids) {
  ids.forEach(enableButton);
}

function enableButton(id) {
  const buttonElement = $(`#${id}`);
  buttonElement.prop('disabled', false).removeClass('unavailable');
  $(`#${id} > .invalid-call-message`).remove();
}

function disableButton(id, message) {
  const buttonElement = $(`#${id}`);
  const messageElement = $(`#${id} > .invalid-call-message`);
  buttonElement.prop('disabled', true).addClass('unavailable');
  if (messageElement.length === 0) {
    buttonElement.append(`<span class="invalid-call-message">${message}</span>`);
  } else {
    messageElement.html(message);
  }
}

module.exports = mediaValidator;
