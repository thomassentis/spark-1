const $ = require('jquery');
const sparkService = require('./sparkService');
const activeCall = require('./activeCall');
const avatar = require('./avatar');

const outgoingCall = {
  callByEmail: (event, constraints) => {
    event.preventDefault();
    const email = $('#user-email').val();

    sparkService.callUser(email, constraints).then((call) => {
      $('#main-content').append($('#calling-template').html().trim());
      $('#callee-email').html(email);

      avatar.display(email, '#callee-image');

      call.on('disconnected error', outgoingCallFailure);

      call.on('connected', () => {
        $('#calling-overlay').remove();
        call.off('disconnected error', outgoingCallFailure);
        activeCall.display(call);
      });

      $('#hangup-calling').on('click', () => {
        call.hangup();
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
