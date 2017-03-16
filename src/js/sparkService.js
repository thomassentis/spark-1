const $ = require('jquery');
const spark = require('ciscospark');

exports.getUser = (email) => {
  return spark.people.list({ email: email }).then((page) => {
    if (page.items.length > 0) {
      return page.items[0];
    }
    return null;
  });
};

exports.register = () => {
  spark.phone.register();
};

exports.callUser = (userEmail) => {
  const constraints = {
    audio: true,
    video: true,
    fake: false
  };

  return spark.phone.createLocalMediaStream(constraints).then((localMediaStream) => {
    var call = spark.phone.dial(userEmail, Object.assign({}, constraints, localMediaStream));

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
