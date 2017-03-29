const $ = require('jquery');
const sparkService = require('./sparkService');
const mediaValidator = require('./mediaValidator');
const incomingCall = require('./incomingCall');
const activeCall = require('./activeCall');
const avatar = require('./avatar');

$('#logout-button').on('click', () => sparkService.logout());

sparkService.register().then(() => {
  $('#call-audio-video').on('click', callByEmail);
  $('#call-audio-only').on('click', (event) => callByEmail(event, { video: false }));

  $('#user-email').on('input propertychange paste', () => {
    if($('#user-email').val().length !== 0) {
      mediaValidator.validateAudio().then(mediaValidator.validateVideo).catch(() => {});
    } else {
      $('#call-audio-only').attr('disabled', true);
      $('#call-audio-video').attr('disabled', true);
    }
  });

  sparkService.listenForCall(incomingCall.display);
});

function callByEmail(event, constraints) {
  event.preventDefault();
  const email = $('#user-email').val();

  sparkService.callUser(email, constraints).then((sparkCall) => {
    $('#main-content').append($('#calling-template').html().trim());
    $('#callee-email').html(email);

    avatar.display(email, '#callee-image');

    sparkCall.on('disconnected error', outgoingCallFailure);

    sparkCall.on('connected', () => {
      $('#calling-overlay').remove();
      sparkCall.off('disconnected error', outgoingCallFailure);
      activeCall.handleCall(sparkCall);
    });

    $('#hangup-calling').on('click', () => {
      sparkCall.hangup();
      $('#calling-overlay').remove();
    });
  });
}

function outgoingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Rejected';
  $('#calling-status').html(message).css('display', 'inline');
  $('#hangup-calling').removeClass('red').addClass('wide').text('Home');
  $('.avatar-image').addClass('failed');
}
