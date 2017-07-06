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
    
    return spark.messages.create({
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

  promiseMembers: (roomId)=>{
    
    return spark.memberships.list({roomId: roomId})
    .then((memberships)=>{
      return Promise.all(
        memberships.items.map((membership)=>spark.people.get(membership.personId)));
    });
  }
};

module.exports = sparkService;
