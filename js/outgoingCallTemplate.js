const $ = require('jquery');
const sparkService = require('./sparkService');
const activeCallTemplate = require('./activeCallTemplate');
const avatar = require('./avatar');
const feedbackTemplate = require('./feedbackTemplate');

const outgoingCallTemplate = {
  callByEmail: (event, constraints) => {
    event.preventDefault();
    const email = $('#user-email').val();

    const call = sparkService.callUser(email, constraints);
    $('#main-content').append($('#outgoing-call-template').html().trim());
    $('#callee-email').html(email);

    feedbackTemplate.displayFeedbackButton(call);

    avatar.display(email, '#callee-image');

    call.on('disconnected error', outgoingCallFailure);

    call.on('connected', () => {
      $('#calling-overlay').remove();
      call.off('disconnected error', outgoingCallFailure);
      activeCallTemplate.display(call);
    });

    $('#hangup-calling').on('click', () => {
      call.hangup();
      $('#calling-overlay').remove();
    });
  }
};

function outgoingCallFailure(error) {
  let message = error ? 'Call Failed' : 'Call Rejected';
  $('#calling-status').html(message).css('display', 'inline');
  $('#hangup-calling').removeClass('red').addClass('wide').text('Home');
  $('.avatar-image').addClass('failed');
}

module.exports = outgoingCallTemplate;
