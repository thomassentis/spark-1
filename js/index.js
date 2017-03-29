const $ = require('jquery');
const sparkService = require('./sparkService');
const mediaValidator = require('./mediaValidator');
const outgoingCall = require('./outgoingCall');
const incomingCall = require('./incomingCall');

$('#logout-button').on('click', () => sparkService.logout());

sparkService.register().then(() => {
  $('#call-audio-video').on('click', outgoingCall.callByEmail);
  $('#call-audio-only').on('click', (event) => outgoingCall.callByEmail(event, { video: false }));

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
