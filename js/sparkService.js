require('./env.js');
const spark = require('ciscospark');
const defaultConstraints = {
  audio: true,
  video: true,
  fake: false
};

const sparkService = {

  authorize: () => {
    return spark.authorize();
  },

  /*
  When you're redirected back from Spark's login page, it grants you a temporary
  code which is then exchanged for an access token. This process is not immediate.
  If you attempt to make any calls to Spark before it finishes, Spark will throw
  an error.
  */
  register: () => {
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
  },

  listenForCall: (callback) => {
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
  },

  callUser: (user, options) => {
    const constraints = Object.assign({}, defaultConstraints, options);
    return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
      return spark.phone.dial(user, {
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: constraints.video
        },
        constraints: constraints,
        localMediaStream: localMediaStream
      });
    });
  },

  logout: () => {
    if(spark.isAuthenticated) {
      return spark.logout({ goto: window.location.protocol + '//' + window.location.host + '/' });
    } else {
      window.location = window.location.protocol + '//' + window.location.host + '/';
    }
  },

  getAvatarUrl: (email) => {
    return spark.people.list({ email: email }).then((people) => {
      if(people.count === 0 || !people.items[0].avatar) {
        return Promise.reject('No avatar found');
      } else {
        return Promise.resolve(people.items[0].avatar);
      }
    });
  },

  answerCall: (call, options) => {
    const constraints = Object.assign({}, defaultConstraints, options);
    return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
      return call.answer({
        offerOptions: {
          offerToReceiveAudio: true,
          offerToReceiveVideo: true
        },
        constraints: constraints,
        localMediaStream: localMediaStream
      });
    });
  }
};

module.exports = sparkService;
