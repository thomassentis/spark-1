const $ = require('jquery');
const sparkService = require('./sparkService');
var ejs = require('ejs');
const fs = require('fs');
//var read = fs.readFileSync;
var join = require('path').join;
var moment = require('moment');

var messagesDisplay = fs.readFileSync(join(__dirname, '/messages.ejs'), 'utf8');
var membersDisplay = fs.readFileSync(join(__dirname, '/members.ejs'), 'utf8');


var roomSelect = $('#room-select');
var messagesBox = $('#messages-box');
var membersBox = $('#members-box');
//var roomIdStock = $('#room-id-stock');
//var currentRoomId;

var namesDictionary = {};

$(() => {
  if(window.location.href.indexOf('error=access_denied') !== -1) {
    $('#logout-button').click();
  }
  $('#message-input').focus();

  initializeRoom();


});

function initializeRoom(){
    startLoadingPage();
    sparkService.promiseRooms(10).then((rooms)=>{

      rooms.items.forEach((room)=>{
          roomSelect.append('<a class="mdl-navigation__link" href="#'+room.id+'" >'+room.title+'</a>');
      });
      currentRoom = rooms.items[0];
      //$('#current-room').attr('alt', currentRoom.id);
      $('#current-room').html(currentRoom.title);
      updateUrlRoomId(currentRoom.id);
      return currentRoom;
  })
  .then((currentRoom)=>{

    displayMembers(currentRoom.id)
    .then((members)=>{
      currentRoomId = urlRoomId();
      namesDictionary = namesDictionaryComposer(members);
      displayMessages(currentRoomId, members);
      setInterval(()=>displayMessages(urlRoomId(), members), 4000);
      scrollDown();
      displayMembers(currentRoomId);

      var roomLinks = $('[class=\'mdl-navigation__link\']');
      roomLinks.on('click', changeRoom);

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
  //event.preventDefault();
  sparkService.logout();

});


// Sending a message
$('#message-form').on('submit', (event) => {
  event.preventDefault();
  submitMessageForm();
});


function submitMessageForm(){

  currentRoomId = urlRoomId();
  var messageText = $('#message-input').val();
  if(messageText){
    sparkService.sendMessage(messageText, currentRoomId)
    .then((message)=>{
      addLastMessage(currentRoomId, message);
    });

    $('#message-input').val('');
  }

}  
    
function changeRoom(){
  url = $(this).attr('href');
  var hash = url.substring(url.indexOf("#")+1);
  currentRoomId = hash;
  
  var currentRoomTitle = $(this).text();
  
  $('#current-room').html(currentRoomTitle);
  
  displayMembers(currentRoomId)
  .then((members)=>{
    return displayMessages(currentRoomId, members);
  }).then(()=>{
    $('#sidebar').attr('class','mdl-layout__drawer');
    $('.mdl-layout__obfuscator').remove();
    scrollDown();
  });
}


function urlRoomId(){
  var url = window.location.hash;
  var hash = url.substring(url.indexOf("#")+1);
  return hash;
}

function updateUrlRoomId(newId){
  window.location.hash = '#'+newId;
}

function startLoadingPage(){
  $('#page').hide();
}

function stopLoadingPage(){
  
  $('#loader').hide();
  $('#page').show();
}

function namesDictionaryComposer(members){
  
  var namesDict = {};
  members.forEach((member)=>{
    namesDict[member.id] = member.displayName;
  });
  return namesDict;
}

function addLastMessage(roomId, message){
  if(namesDictionary){
    
    return sparkService.promiseLastMessage(roomId).then((messages)=>{
          messagesBox.append(formatMessage(messages.items[0], namesDictionary[message.personId]));
          }).then(()=>{
            scrollDown();
	  });
  }
}

function displayMessages(roomId, members){
  
  var newMessages = '';
  
  return sparkService.promiseMessages(roomId).then((messages)=>{
        
        messages.items.forEach((message)=>{
          //newMessages = formatMessage(message, namesDictionary[message.personId]) + newMessages;
          message = Object.assign(message, {nameAuthor : namesDictionary[message.personId]});
          
        });
        //var str = '<% messages.forEach((message)=>{ %><%= message.nameAuthor %><%= convertDate(message.created) %><% }); %>';
        //var str = fs.readFile(join(__dirname, '/messages.ejs'), 'utf8');
        //console.log(str);
        newMessages = ejs.render(messagesDisplay, {messages : messages.items, convertDate : convertDate});
        messagesBox.html(newMessages);
        
      });
}

function displayMembers(roomId){
  membersBox.html('');
  
  return sparkService.promiseMembers(roomId)
  .then((members)=>{
    //console.log(members);
    newMembers = ejs.render(membersDisplay, {members: members});
    membersBox.html(newMembers);
    return members;
  });
}

function scrollDown(){
    window.scrollTo(0,$('#scrolled-block').scrollHeight);
}

function convertDate(stringDate){
  let d = new Date(stringDate);
  d = moment(d).calendar();
  //alert(stringDate);
  return d;
}


// Sending a part info
$('#part-sent').on('click', (event) => {
  event.preventDefault();
  $('#message-input').val(JSON.stringify(window.PART));
  console.log("Test message");
});
