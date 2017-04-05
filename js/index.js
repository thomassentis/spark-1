const $ = require('jquery');
const sparkService = require('./sparkService');
const mediaValidator = require('./mediaValidator');
const outgoingCallTemplate = require('./outgoingCallTemplate');
const incomingCallTemplate = require('./incomingCallTemplate');

$(() => {
  if(window.location.href.indexOf('error=access_denied') !== -1) {
    $('#logout-button').click();
  }
});

$('#logout-button').on('click', () => sparkService.logout());

sparkService.register().then(() => {
  $('#call-audio-video').on('click', outgoingCallTemplate.callByEmail);
  $('#call-audio-only').on('click', (event) => outgoingCallTemplate.callByEmail(event, { video: false }));
  mediaValidator.validateMedia();

  $('#user-email').on('input propertychange paste', () => {
    if($('#user-email').val().length !== 0) {
      mediaValidator.validateMedia();
    } else {
      $('#call-audio-only').prop('disabled', true);
      $('#call-audio-video').prop('disabled', true);
    }
  });

  sparkService.listenForCall(incomingCallTemplate.display);
});
