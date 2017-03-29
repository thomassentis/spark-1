require('./env.js');
const spark = require('ciscospark');
const defaultConstraints = {
  audio: true,
  video: true,
  fake: false
};
const offerOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
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
    let authenticationUpdate = () => {
      if (spark.isAuthenticated) {
        spark.off('change:isAuthenticated', authenticationUpdate);
        spark.phone.register().then(() => {
          resolve();
        });
      }
    };

    spark.on('change:isAuthenticated', authenticationUpdate);
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
  });
};

exports.answerCall = (call, options) => {
  const constraints = Object.assign({}, defaultConstraints, options);
  return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
    return call.answer({
      offerOptions: offerOptions,
      constraints: constraints,
      localMediaStream: localMediaStream
    });
  });
};

exports.rejectCall = (call) => {
  call.reject();
};

exports.callUser = (user, options) => {
  const constraints = Object.assign({}, defaultConstraints, options);
  return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
    return spark.phone.dial(user, {
      offerOptions: offerOptions,
      constraints: constraints,
      localMediaStream: localMediaStream
    });
  });
};

exports.hangupCall = (call) => {
  return call.hangup();
};

exports.logout = () => {
  if(spark.isAuthenticated){
    return spark.logout({ goto: window.location.protocol + '//' + window.location.host + '/' });
  } else {
    window.location = window.location.protocol + '//' + window.location.host + '/';
  }
};

exports.getAvatarUrl = (email) => {
  return spark.people.list({ email: email }).then((people) => {
    if(people.count === 0 || !people.items[0].avatar) {
      return Promise.reject('No avatar found');
    } else {
      return Promise.resolve(people.items[0].avatar);
    }
  });
};
