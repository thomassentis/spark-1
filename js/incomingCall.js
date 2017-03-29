const $ = require('jquery');
const sparkService = require('./sparkService');
const mediaValidator = require('./mediaValidator');
const avatar = require('./avatar');
const activeCall = require('./activeCall');

const incomingCall = {
  display: (call) => {
    const email = call.from.person.email;

    $('#main-content').append($('#incoming-call-template').html().trim());

    $('#caller-email').html(email);
    avatar.display(email, '#caller-image');
    mediaValidator.validateAudio().then(mediaValidator.validateVideo);

    call.on('disconnected error', incomingCallFailure);

    $('#answer-audio-video').on('click', () => {
      answerCall(call);
    });

    $('#answer-audio-only').on('click', () => {
      answerCall(call, { video: false });
    });

    $('#reject').on('click', () => {
      if (call.status !== 'disconnected') {
        sparkService.rejectCall(call);
      }
      clearIncomingCall();
    });
  }
};

function answerCall(call, constraints) {
  sparkService.answerCall(call, constraints).then(() => activeCall.handleCall(call));
  call.off('disconnected error', incomingCallFailure);
  clearIncomingCall();
}

function clearIncomingCall() {
  $('#incoming-call-overlay').remove();
}

function incomingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Cancelled';
  $('#incoming-call-status').html(message).css('display', 'inline');
  $('#answer-audio-video').css('display', 'none');
  $('#answer-audio-only').css('display', 'none');
  $('#reject').removeClass('red').addClass('wide').text('Home');
  $('.avatar-image').addClass('failed');
  $('#incoming-call-overlay h1').css('display', 'none');
}

module.exports = incomingCall;
