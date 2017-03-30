const $ = require('jquery');
let currentCall = null;

const feedback = {
  displayFeedbackButton: (call) => {
    $('#feedback').removeClass('hidden');
    $('#feedback').off('click');
    $('#feedback').on('click', (event) => {
      event.preventDefault();
      displayFeedbackOverlay(call);
    });
    removeOverlay();
  }
};

function displayFeedbackOverlay(call) {
  currentCall = call;
  $('#main-content').append($('#user-feedback-template').html().trim());
  prepareEventListeners();
}

function prepareEventListeners() {
  $('#submit-feedback').on('click', submitUserFeedback);
  $('#cancel').on('click', removeOverlay);
}

function submitUserFeedback() {
  let feedback = {
    userComments: $('#feedback-comments').val()
  };
  currentCall.sendFeedback(feedback);
  removeOverlay();
}

function removeOverlay() {
  currentCall = null;
  $('#user-feedback-overlay').remove();
}

module.exports = feedback;