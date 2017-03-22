require('./env.js');
const spark = require('ciscospark');
const constraints = {
  audio: true,
  video: true,
  fake: false
};

exports.authorize = () => {
  return spark.authorize();
};

/*
When you're redirected back from Spark's login page, it grants you a temporary
code which is then exchanged for an access token. This process is not immediate.
If you attempt to make any calls to Spark before it finishes, Spark will throw
an error.
*/
exports.register = () => {
  return new Promise((resolve) => {
    let authenticatedListener = spark.on('change:isAuthenticated', () => {
      if (spark.isAuthenticated) {
        spark.off('change:isAuthenticated', authenticatedListener);
        spark.phone.register().then(() =>{
          resolve();
        });
      }
    });
  });
};

exports.listen = (callback) => {
  spark.phone.on('call:incoming', (call) => {
    /*
    The call:incoming event is triggered for both incoming and outgoing calls.
    Outgoing calls are handled by SparkService.callUser(...).
    */
    if (call.direction === 'out') {
      return;
    }

    callback(call);

    call.acknowledge();

    return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
      return call.answer(Object.assign({}, constraints, { localMediaStream: localMediaStream }));
    });
  });
};

exports.callUser = (userEmail) => {
  return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
    return spark.phone.dial(userEmail, Object.assign({}, constraints, localMediaStream));
  });
};

exports.hangupCall = (call) => {
  return call.hangup();
};

exports.logout = () => {
  return spark.logout({ goto: window.location.protocol + '//' + window.location.host + '/' });
};