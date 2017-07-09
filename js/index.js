const $ = require('jquery');
const sparkService = require('./sparkService');

var roomSelect = $('#room-select');
var messagesBox = $('#messages-box');
var membersBox = $('#members-box');
var roomIdStock = $('#room-id-stock');
var currentRoomId;

var namesD = {};

$(() => {
  if(window.location.href.indexOf('error=access_denied') !== -1) {
    $('#logout-button').click();
  }
  $('#message-input').focus();

  initializeRoom();


});

function initializeRoom(){
    startLoadingPage();
    var p = sparkService.promiseRooms(10).then((rooms)=>{

      rooms.items.forEach((room)=>{
          roomSelect.append('<a class="mdl-navigation__link" href="#'+room.id+'" >'+room.title+'</a>');
      });
      roomIdStock.html(rooms.items[0].id);
      currentRoomId = roomIdStock.html();
      $('#current-room').html(rooms.items[0].title);
      //currentRoomId = roomSelect.value;
      //alert(currentRoomId);
      return currentRoomId;
  }).then((currentRoomId)=>{

    displayMembers(currentRoomId)
    .then((members)=>{
      currentRoomId = roomIdStock.html();
      namesD = namesDictionary(members);
      displayMessages(currentRoomId, members);
      setInterval(()=>displayMessages(currentRoomId, members), 4000);
      scrollDown();
      displayMembers(currentRoomId);
      $('a').on('click', ()=>{
          var url = window.location.hash;
          var hash = url.substring(url.indexOf("#")+1);
          roomIdStock.html(hash);
          currentRoomId = hash; 
          //alert(currentRoomId);
          $('#current-room').html($('[href=\'#'+currentRoomId+'\']').html());
          displayMembers(currentRoomId)
          .then((members)=>{
            return displayMessages(currentRoomId, members);
          }).then(()=>{
            $('#sidebar').attr('class','mdl-layout__drawer');
            $('.mdl-layout__obfuscator').remove();
            scrollDown();
          });

      });
  }).then(()=>stopLoadingPage());
  });
}



// Changing the room
/*roomSelect.on('change', function(){
  //currentRoomId = roomSelect.val();
  
  displayMembers(currentRoomId)
  .then((members)=>{
    return displayMessages(currentRoomId, members);
  }).then(()=>{
    scrollDown();
  })
});
*/



// Logging out
$('#logout-button').on('click', () => {
  sparkService.logout();
});


// Sending a message
$('#message-form').on('submit', (event) => {
  event.preventDefault();
  currentRoomId = roomIdStock.html();
  var messageText = $('#message-input').val();
  if(messageText){
    //var rooms = sparkService.getRooms(10);
    //var currentRoomId = roomSelect.val();
    //alert(currentRoomId);
    sparkService.sendMessage(messageText, currentRoomId)
    .then((message)=>{
      addLastMessage(currentRoomId, message);
    });

    $('#message-input').val('');
    
  }
    
  
});

function startLoadingPage(){
  $('#page').hide();
}

function stopLoadingPage(){
  $('#loader').hide();
  $('#page').show();
}

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
          //console.log(message.roomType);
        });
        messagesBox.html(newMessages);
        
      });
}

function displayMembers(roomId){
  membersBox.html('');
  //alert(roomId);
  return sparkService.promiseMembers(roomId)
  .then((members)=>{
    members.forEach((member)=>{
      membersBox.append('<div>'+member.displayName+'</div>');
    });
    return members;
  });
}

function scrollDown(){
    window.scrollTo(0,$('#scrolled-block').scrollHeight);
}

function convertDate(stringDate){
  d = new Date(stringDate);
  return d;
}

function formatMessage(message, name){
  format = '<p><div>'+name+' '+convertDate(message.created)+'</div>'+message.text+'</p>';
  
  if(message.files){
    images = message.files;
    images.forEach((image)=>{
      //format += '<img src="'+image+'" >';
      format += image;
    });
    
  }
  return format;
}

