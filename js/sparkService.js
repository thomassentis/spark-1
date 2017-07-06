require('./env.js');
const spark = require('ciscospark');
const defaultConstraints = {
  audio: true,
  video: true,
  fake: false
};
const defaultOfferOptions = {
  offerToReceiveAudio: true,
  offerToReceiveVideo: true
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

  promiseRooms: (limit)=>{
    return spark.rooms.list({
      max: limit
    });
  },

  selectRoom: (rooms, roomTitle)=>{
    return rooms.then(function(rooms) {
        var room = rooms.items.filter(function(room) {
          return room.title === 'My First Room';
        })[0];
        return room;
      });

  },

  promiseRoomByTitle: (limit, roomTitle)=>{
    return spark.rooms.list({
      max: 10
    })
      .then(function(rooms) {
        var room = rooms.items.filter(function(room) {
          return room.title === 'My First Room';
        })[0];
        return room;
      });

  },

  sendMessage: (message, roomId) => {
    
    spark.messages.create({
          text: message,
          roomId: roomId
        })
      .catch(function(reason) {
        console.error(reason);
        process.exit(1);
      });    
  },

  promiseMessages: (roomId)=>{

    return spark.messages.list({roomId: roomId});
  },

  promiseLastMessage: (roomId)=>{
    return spark.messages.list(
      {roomId: roomId,
        max: 1});
  },

  /*register: () => {
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
      // The call:incoming event is triggered for both incoming and outgoing calls.
      // Outgoing calls are handled by SparkService.callUser(...).
      if (call.direction === 'out') {
        return;
      }

      callback(call);

      call.acknowledge();
    });
  },

  callUser: (user, options) => {
    const constraints = Object.assign({}, defaultConstraints, options);
    return spark.phone.dial(user, {
      offerOptions: defaultOfferOptions,
      constraints: constraints
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
      if(people.items.length && people.items[0].avatar) {
        return people.items[0].avatar;
      }
    });
  },

  answerCall: (call, options) => {
    const constraints = Object.assign({}, defaultConstraints, options);
    return call.answer({
      offerOptions: defaultOfferOptions,
      constraints: constraints
    });
  }*/
};

module.exports = sparkService;
