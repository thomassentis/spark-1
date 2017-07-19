const $ = require('jquery');
const sparkService = require('./sparkService');
var ejs = require('ejs');
const fs = require('fs');
//var read = fs.readFileSync;
var join = require('path').join;
var moment = require('moment');
require('material-design-lite');
//require('jquery.scrollTo');

var messagesDisplay = fs.readFileSync(join(__dirname, '/messages.ejs'), 'utf8');
var messageDisplay = fs.readFileSync(join(__dirname, '/message.ejs'), 'utf8');
var membersDisplay = fs.readFileSync(join(__dirname, '/members.ejs'), 'utf8');


var roomSelect = $('#room-select');
var messagesBox = $('#messages-box');
var membersBox = $('#members-box');

$('#attach-file-button').on('click', (event)=>{
    event.preventDefault();
    $('#attached-file').val('http://www.projx-services.com/wp-content/uploads/2014/12/spare-parts.jpg');
    
});

var namesDictionary = {};
var xhr = {};

$(() => {
  
  $('#message-input').focus();
  $('#attached-file').val('');
  initializeRoom();
});

function initializeRoom(){
    startLoadingPage();
    
    sparkService.promiseRooms(10).then((rooms)=>{

      rooms.items.forEach((room)=>{
          roomSelect.append('<a class="mdl-navigation__link" href="#'+room.id+'" >'+room.title+'</a>');
      });
      currentRoom = rooms.items[0];
      $('#current-room').html(currentRoom.title);
      updateUrlRoomId(currentRoom.id);
      return currentRoom;
  }, (error)=>handleUnauthorize(error))
  .then((currentRoom)=>{

    displayMembers(currentRoom.id)
    .then((members)=>{
      currentRoomId = urlRoomId();
      namesDictionary = namesDictionaryComposer(members);
      displayMessages(currentRoomId, members);
      setInterval(()=>updateMessagesDisplay(urlRoomId(), members), 4000);
      scrollDown();
      displayMembers(currentRoomId);

      var roomLinks = $('[class=\'mdl-navigation__link\']');
      roomLinks.on('click', changeRoom);

  }).then(()=>stopLoadingPage());
  });
}

// Logging out
$('#logout-button').on('click', (event) => {
  event.preventDefault();
  startLoadingPage();
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
  var attachedFile = $('#attached-file').val();
  if(messageText){
    var content = {text: messageText, file: attachedFile};
    sparkService.sendMessage(content, currentRoomId)
    .then((message)=>{
      updateMessagesDisplay(currentRoomId);
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
    $('.mdl-layout__obfuscator').hide();
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
  
  return sparkService.promiseMessages(roomId).then((messages)=>{
        messagesBox.html('');
        messages.items.reverse().forEach((message)=>{
          displayMessage(message);
        });
        
      });
}

function updateMessagesDisplay(roomId, members){
    scrollDown();
    return sparkService.updateMessages(roomId).then((messages)=>{
      lastMessageId = $('.message').last().attr('id');
      newMessage = messages.items[0];
      if(lastMessageId != newMessage.id){
        displayMessage(newMessage);
      }
    });
}

function displayMembers(roomId){
  membersBox.html('');
  
  return sparkService.promiseMembers(roomId)
  .then((members)=>{
    newMembers = ejs.render(membersDisplay, {members: members});
    membersBox.html(newMembers);
    return members;
  });
}

function displayMessage(message){

  message = Object.assign(message, {nameAuthor : namesDictionary[message.personId]});
  newMessage = ejs.render(messageDisplay, {message: message, convertDate: convertDate});
  messagesBox.append(newMessage);
  scrollDown();
  if(message.files){
    addFileToMessage(message);
  }
}

function scrollDown(){
    //$('#scrolled-block').scrollTo(100);
    
}

function convertDate(stringDate){
  let d = new Date(stringDate);
  d = moment(d).calendar();
  return d;
}

function addFileToMessage(message){

  apiUrl = message.files[0];
  var messageId = message.id;
  xhr[messageId] = new XMLHttpRequest();
  xhr[messageId].open('GET', apiUrl, true);
  xhr[messageId].setRequestHeader("Accept", "application/json");
  xhr[messageId].setRequestHeader("Content-Type", "application/json");
  xhr[messageId].setRequestHeader("Authorization", "Bearer NGJhMTkyNzMtMjIzZi00YjlkLTk3YTEtM2E3NzZjMGFhNWMyZWQzMDdiN2EtZmZi");
  xhr[messageId].setRequestHeader("X-Requested-With", "XMLHttpRequest");
  xhr[messageId].responseType = "arraybuffer";
  
  xhr[messageId].onload = function(){
    if(xhr[messageId].readyState == 4){
      var u8 = new Uint8Array(xhr[messageId].response);
      var b64encoded = btoa(String.fromCharCode.apply(null, u8));
      var imageSrc = 'data:image/png;base64,'+b64encoded;
      $('#'+messageId+' > img').attr('src', imageSrc);
    }
  }
  xhr[messageId].send(null);
}

function handleUnauthorize(error){
  if(error.message == "not authenticated" || error.message == "Authorization cannot be refreshed"){
    
    sparkService.authorize();
  } 
  
  window.location.hash = "";
  window.location.assign("index.html");
  
}

// Sending a part info
$('#part-send-button').on('click', (event) => {
  event.preventDefault();
  $('#message-input').val(JSON.stringify(window.PART));
  submitMessageForm();
});
