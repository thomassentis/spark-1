const $ = require('jquery');
const sparkService = require('./sparkService');

var roomSelect = $('#room-select');
var messagesBox = $('#messages-box');
var membersBox = $('#members-box');
var currentRoomId;

var namesD = {};

$(() => {
  if(window.location.href.indexOf('error=access_denied') !== -1) {
    $('#logout-button').click();
  }
  $('#message-input').focus();
  var p = sparkService.promiseRooms(10).then((rooms)=>{

      rooms.items.forEach((room)=>{
          roomSelect.append('<option value="'+room.id+'">'+room.title+'</option>');
      });
      roomSelect.value = rooms.items[0].id;
      currentRoomId = roomSelect.value;
  }).then(()=>{
    return displayMembers(currentRoomId);
  })
  .then((members)=>{
      namesD = namesDictionary(members);
      displayMessages(roomSelect.value, members);
      $('#select-box').show();
      setInterval(()=>{displayMessages(currentRoomId, members);}, 4000);
      scrollDown();
      displayMembers(currentRoomId);
  });
    
  
//alert(roomSelect.val());

});

// Changing the room
roomSelect.on('change', function(){
  currentRoomId = roomSelect.val();
  
  displayMembers(currentRoomId)
  .then((members)=>{
    return displayMessages(currentRoomId, members);
  }).then(()=>{
    scrollDown();
  })
});

// Logging out
$('#logout-button').on('click', () => {
  sparkService.logout();
});


// Sending a message
$('#message-form').on('submit', (event) => {
  event.preventDefault();
  var messageText = $('#message-input').val();
  if(messageText){
    //var rooms = sparkService.getRooms(10);
    var currentRoomId = roomSelect.val();
    //alert(currentRoomId);
    sparkService.sendMessage(messageText, currentRoomId)
    .then((message)=>{
      addLastMessage(currentRoomId, message);
    });

    $('#message-input').val('');
    
  }
    
  
});

function namesDictionary(members){
  
  var namesDict = {};
  members.forEach((member)=>{
    namesDict[member.id] = member.displayName;
  });
  return namesDict;
}



function addLastMessage(roomId, message){
  if(namesD){
    console.log('OK BANANA');
    return sparkService.promiseLastMessage(roomId).then((messages)=>{
          messagesBox.append(formatMessage(messages.items[0], namesD[message.personId]));
          }).then(()=>{
            scrollDown();
            //alert('ok')
	  });
  }
}

function displayMessages(roomId, members){
  
  var newMessages = '';
  //var namesDictionary = namesDictionary(members);
  
  return sparkService.promiseMessages(roomId).then((messages)=>{
        messages.items.forEach((message)=>{
          newMessages = formatMessage(message, namesD[message.personId]) + newMessages;
        });
        messagesBox.html(newMessages);
        
      });
}

function displayMembers(roomId){
  membersBox.html('');
  return sparkService.promiseMembers(roomId)
  .then((members)=>{
    members.forEach((member)=>{
      membersBox.append('<div>'+member.displayName+'</div>');
    });
    return members;
  });
}

function scrollDown(){
    window.scrollTo(0,document.body.scrollHeight);
}

function convertDate(stringDate){
  let d = new Date(stringDate);
  return d;
}

// Message creation
function formatMessage(message, name) {
  let body = '<p class="msg"><div class="mui--text-caption"> <div class="msg-label">'
  body += name +'</div> <div class="msg-date">'
  body += convertDate(message.created)+'</div></div>'
  body += message.text+'</p>';
  return body;
}

