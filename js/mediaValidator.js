const $ = require('jquery');

const dict = {
  audioOutgoing: {
    mediaType: { audio: true, video: false },
    enableFunction: enableCallButton,
    enableId: 'call-audio-only',
    disableIds: ['call-audio-only', 'call-audio-video'],
    errorFunction: getAudioErrorMessage
  },
  videoOutgoing: {
    mediaType: { audio: false, video: true },
    enableFunction: enableCallButton,
    enableId: 'call-audio-video',
    disableIds: ['call-audio-video'],
    errorFunction: getVideoErrorMessage
  },
  audioIncoming: {
    mediaType: { audio: true, video: false },
    enableFunction: enableButton,
    enableId: 'answer-audio-only',
    disableIds: ['answer-audio-only', 'answer-audio-video'],
    errorFunction: getAudioErrorMessage
  },
  videoIncoming: {
    mediaType: { audio: false, video: true },
    enableFunction: enableButton,
    enableId: 'answer-audio-video',
    disableIds: ['answer-audio-video'],
    errorFunction: getVideoErrorMessage
  }
};

const mediaValidator = {
  validateMedia: () => {
    validateAMedia(dict.audioOutgoing).then(() => validateAMedia(dict.videoOutgoing)).catch(() => {});
    validateAMedia(dict.audioIncoming).then(() => validateAMedia(dict.videoIncoming)).catch(() => {});
  }
};

function validateAMedia(options) {
  return navigator.mediaDevices.getUserMedia(options.mediaType).then(() => {
    options.enableFunction(options.enableId);
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

function enableCallButton(id) {
  if($('#user-email').val().length === 0) return $(`#${id}`).attr('disabled', true);
  enableButton(id);
}

function enableButton(id) {
  const buttonElement = $(`#${id}`);
  buttonElement.attr('disabled', false).removeClass('unavailable');
  $(`#${id} > .invalid-call-message`).remove();
}

function disableButton(id, message) {
  const buttonElement = $(`#${id}`);
  const messageElement = $(`#${id} > .invalid-call-message`);
  buttonElement.attr('disabled', true).addClass('unavailable');
  if (messageElement.length === 0) {
    buttonElement.append(`<span class="invalid-call-message">${message}</span>`);
  } else {
    messageElement.html(message);
  }
}

module.exports = mediaValidator;
