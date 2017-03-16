require('./env.js');
const spark = require('ciscospark');
const $ = require('jquery');

initializeAuthentication();

$('#login_button').on('click', (event) => {
  spark.authorize().then(
    (result) => {
      if(spark.isAuthenticated) {
        window.location.pathname = 'index.html';
      }
    }).catch(
    (error) => console.log(error));
});

function initializeAuthentication() {
  Object.assign(spark.config.credentials.oauth, {
    client_id: process.env.CISCOSPARK_CLIENT_ID,
    client_secret: process.env.CISCOSPARK_CLIENT_SECRET,
    scope: process.env.CISCOSPARK_SCOPE,
    redirect_uri: process.env.CISCOSPARK_REDIRECT_URI
  });
}
