require('./env.js');
const $ = require('jquery');
const spark = require('ciscospark');

exports.authorize = () => {
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
    return spark.phone.dial(userEmail, Object.assign({}, constraints, localMediaStream));
  });
};

exports.hangupCall = (call) => {
  return call.hangup();
};
