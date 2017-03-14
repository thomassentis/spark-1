require('./env.js');
const spark = require('ciscospark');
const $ = require('jquery');

$('#submit_user_email').on('click', function(event) {
  event.preventDefault();

  const email = $('#user_email').val();
  spark.people.list({ email: email }).then(function(page) {
    if (page.items.length > 0) {
      $('#display_name').html(page.items[0].displayName);
    } else {
      $('#display_name').html('No user found');
    }
  }).catch(function(error) {
    $('#display_name').html('Error: Spark failure');
  });
});