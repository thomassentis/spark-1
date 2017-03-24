require('./env.js');
const SPARK = require('ciscospark');
const CONSTRAINTS = {
  audio: true,
  video: true,
  fake: false
};

exports.authorize = () => {
  return SPARK.authorize();
};

/*
When you're redirected back from Spark's login page, it grants you a temporary
code which is then exchanged for an access token. This process is not immediate.
If you attempt to make any calls to Spark before it finishes, Spark will throw
an error.
*/
exports.register = () => {
  return new Promise((resolve) => {
    let authenticatedListener = SPARK.on('change:isAuthenticated', () => {
      if (SPARK.isAuthenticated) {
        SPARK.off('change:isAuthenticated', authenticatedListener);
        SPARK.phone.register().then(() => {
          resolve();
        });
      }
    });
  });
};

exports.listen = (callback) => {
  SPARK.phone.on('call:incoming', (call) => {
    /*
    The call:incoming event is triggered for both incoming and outgoing calls.
    Outgoing calls are handled by SparkService.callUser(...).
    */
    if (call.direction === 'out') {
      return;
    }

    callback(call);

    call.acknowledge();
  });
};

exports.answerCall = (call) => {
  return SPARK.phone.createLocalMediaStream(CONSTRAINTS).then((localMediaStream) => {
    return call.answer(Object.assign({}, CONSTRAINTS, { localMediaStream: localMediaStream }));
  });
};

exports.rejectCall = (call) => {
  call.reject();
};

exports.callUser = (userEmail) => {
  return SPARK.phone.createLocalMediaStream(CONSTRAINTS).then((localMediaStream) => {
    return SPARK.phone.dial(userEmail, Object.assign({}, CONSTRAINTS, localMediaStream));
  });
};

exports.hangupCall = (call) => {
  return call.hangup();
};

exports.logout = () => {
  return SPARK.logout({ goto: window.location.protocol + '//' + window.location.host + '/' });
};

exports.getAvatarUrl = (email) => {
  return SPARK.people.list({ email: email }).then((people) => {
    if(people.count === 0 || !people.items[0].avatar) {
      return Promise.reject('No avatar found');
    } else {
      return Promise.resolve(people.items[0].avatar);
    }
  });
};
