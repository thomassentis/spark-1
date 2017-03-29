const $ = require('jquery');
const sparkService = require('./sparkService');
const activeCall = require('./activeCall');
const avatar = require('./avatar');

const outgoingCall = {
  callByEmail: (event, constraints) => {
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
};

function outgoingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Rejected';
  $('#calling-status').html(message).css('display', 'inline');
  $('#hangup-calling').removeClass('red').addClass('wide').text('Home');
  $('.avatar-image').addClass('failed');
}

module.exports = outgoingCall;
