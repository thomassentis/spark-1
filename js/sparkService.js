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

    var sp = spark.init({
      config: {
        credentials: {
          authorizationString: 'https://api.ciscospark.com/v1/authorize?client_id=C2bd67830b569b3d130edaef22e266bd1e080a4bb4aa71e20eec44da5e56689e0&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A8000%2Findex.html&scope=spark%3Aall%20spark%3Akms'
        }
      }
    });

      sp.authorize();
      /*sp.once(`ready`, function() {
        if (sp.canAuthorize) {
            
        }else {
          sp.authorization.initiateLogin()
        }
      });*/

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

  sendMessage: (content, roomId) => {
    var envelope = {text: content.text,
          roomId: roomId};
    if(content.file){
      envelope.files = [content.file];
    }
    
    return spark.messages.create(envelope)
      .catch(function(reason) {
        console.error(reason);
        process.exit(1);
      });
  },

  promiseMessages: (roomId)=>{

    return spark.messages.list({roomId: roomId});
  },

  updateMessages: (roomId)=>{
    return spark.messages.list({roomId: roomId, max: 1});
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
  },

  logout: () => {
    if(spark.isAuthenticated) {
      return spark.logout({ goto: window.location/*.protocol + '//' + window.location.host + '/' */});
    } else {
      window.location = window.location.protocol + '//' + window.location.host + '/';
    }
  }
};

module.exports = sparkService;
