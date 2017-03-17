require('./env.js');
const $ = require('jquery');
const spark = require('ciscospark');

exports.authorize = () => {
  Object.assign(spark.config.credentials.oauth, {
    client_id: process.env.CISCOSPARK_CLIENT_ID,
    client_secret: process.env.CISCOSPARK_CLIENT_SECRET,
    scope: process.env.CISCOSPARK_SCOPE,
    redirect_uri: process.env.CISCOSPARK_REDIRECT_URI
  });

  return spark.authorize();
};

exports.waitForAuthentication = () => {
  return new Promise((resolve, reject) => {
    let authenticatedListener = spark.on('change:isAuthenticated', () => {
      if (spark.isAuthenticated) {
        spark.off('change:isAuthenticated', authenticatedListener);
        resolve();
      }
    });
  });
};

exports.register = () => {
  return spark.phone.register();
};

exports.callUser = (userEmail) => {
  const constraints = {
    audio: true,
    video: true,
    fake: false
  };

  return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
    let call = spark.phone.dial(userEmail, Object.assign({}, constraints, localMediaStream));

    call.on('connected', () => {
      $('#incoming_call').attr('src', call.remoteMediaStreamUrl);
    });
    call.on('localMediaStream:change', () => {
      $('#outgoing_call').attr('src', call.localMediaStreamUrl);
    });

    return call;
  });
};

exports.hangupCall = (call) => {
  call.hangup();
  $('#incoming_call').attr('src', '');
  $('#outgoing_call').attr('src', '');
};
