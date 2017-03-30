const $ = require('jquery');
let currentCall = null;

const feedback = {
  displayFeedbackOverlay: (call) => {
    currentCall = call;
    $('#main-content').append($('#user-feedback-template').html().trim());
    prepareEventListeners();
  }
};

function prepareEventListeners() {
  $('#submit-feedback').on('click', submitUserFeedback);
  $('#cancel').on('click', () => {
    removeOverlay();
  });
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