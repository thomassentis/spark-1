const $ = require('jquery');

const mediaValidator = {
  validateAudio: () => {
    return validateMedia({ audio: true, video: false }, [
      'call-audio-only',
      'answer-audio-only'
    ], [
      'call-audio-video',
      'answer-audio-video'
    ]);
  },
  validateVideo: () => {
    return validateMedia({ audio: false, video: true }, [
      'call-audio-video',
      'answer-audio-video'
    ]);
  }
};

function validateMedia(options, ids, disableOnlyIds) {
  return checkMediaAvailability(options).then(() => {
    ids.forEach((id) => enableCallButton(id));
    return Promise.resolve();
  }).catch((error) => {
    ids.concat(disableOnlyIds).forEach((id) => disableCallButton(id, error));
    return Promise.reject();
  });
}

function checkMediaAvailability(options) {
  return navigator.mediaDevices.getUserMedia(options).catch((error) => {
    if(options.audio) return Promise.reject(error.name === 'NotFoundError' ? 'No microphone found' : 'Call requires audio permission');
    return Promise.reject(error.name === 'NotFoundError' ? 'No camera found' : 'Call requires video permission');
  });
}

function enableCallButton(id) {
  $('#' + id).attr('disabled', false).removeClass('disabled');
  $('#' + id + '> .invalid-call-message').remove();
}

function disableCallButton(id, message) {
  const buttonElement = $(`#${id}`);
  const messageElement = $(`#${id} > .invalid-call-message`);
  buttonElement.attr('disabled', true).addClass('disabled');
  if (messageElement.length === 0) {
    buttonElement.append('<span class="invalid-call-message">' + message + '</span>');
  } else {
    messageElement.html(message);
  }
}

module.exports = mediaValidator;
