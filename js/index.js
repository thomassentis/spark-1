const $ = require('jquery');
const sparkService = require('./sparkService');
var ejs = require('ejs');
const fs = require('fs');
//var read = fs.readFileSync;
var join = require('path').join;
var moment = require('moment');
require('material-design-lite');


var messagesDisplay = fs.readFileSync(join(__dirname, '/messages.ejs'), 'utf8');
var messageDisplay = fs.readFileSync(join(__dirname, '/message.ejs'), 'utf8');
var membersDisplay = fs.readFileSync(join(__dirname, '/members.ejs'), 'utf8');


var roomSelect = $('#room-select');
var messagesBox = $('#messages-box');
var membersBox = $('#members-box');

$('#attach-file-button').on('click', (event)=>{
    event.preventDefault();
    $('#attached-file').val('http://images4.fanpop.com/image/photos/22400000/Cute-Kitten-kittens-22438020-480-360.jpg');
    
});

var namesDictionary = {};
var xhr = {};

$(() => {
  if(window.location.href.indexOf('error=access_denied') !== -1) {
    $('#logout-button').click();
  }
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
  })
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
  var attachedFile = $('#attached-file').val();
  console.log(attachedFile);
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
  
  //var newMessages = '';
  
  return sparkService.promiseMessages(roomId).then((messages)=>{
        /*var apiUrl;
        messages.items.forEach((message)=>{
          
          if(message.files) {
            apiUrl = message.files[0];
            console.log(apiUrl);
            xhr[messageId] = new XMLHttpRequest();
            xhr[messageId].open('GET', 'https://api.ciscospark.com/v1/contents/Y2lzY29zcGFyazovL3VzL0NPTlRFTlQvZmY4NDcwNDAtNmFmOS0xMWU3LWIwODItYjc2NjE4ZTcyNDcwLzA', true);
            xhr[messageId].setRequestHeader("Accept", "application/json");
            xhr[messageId].setRequestHeader("Content-Type", "application/json");
            xhr[messageId].setRequestHeader("Authorization", "Bearer NGJhMTkyNzMtMjIzZi00YjlkLTk3YTEtM2E3NzZjMGFhNWMyZWQzMDdiN2EtZmZi");
            xhr[messageId].setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr[messageId].responseType = "arraybuffer";
            
            xhr[messageId].onload = function(){
              if(xhr[messageId].readyState == 4){
                var u8 = new Uint8Array(xhr[messageId].response);
                var b64encoded = btoa(String.fromCharCode.apply(null, u8));
                var imgSrc = 'data:image/png;base64,'+b64encoded;
                
              }
            }
            xhr[messageId].send(null);
          }else{
            var imgSrc = 'images/cat.jpg';
          }
          message = Object.assign(message, {nameAuthor : namesDictionary[message.personId], imageSrc: 'images/cat.jpg'});
/*
            getImageSrc(message.files[0]).then((imageSrc)=>{
              message = Object.assign(message, {nameAuthor : namesDictionary[message.personId], imageSrc: imageSrc});
            })
          
        });
        return messages;
      }).then((messages)=>{
        console.log(messages.items[0].nameAuthor);
        //var str = '<% messages.forEach((message)=>{ %><%= message.nameAuthor %><%= convertDate(message.created) %><% }); %>';
        //var str = fs.readFile(join(__dirname, '/messages.ejs'), 'utf8');
        newMessages = ejs.render(messagesDisplay, {messages : messages.items, convertDate : convertDate});
        messagesBox.html(newMessages);*/
        messagesBox.html('');
        messages.items.reverse().forEach((message)=>{
          displayMessage(message);
          //newMessage = ejs.render(messageDisplay, {message: message, convertDate: convertDate});
          //messagesBox.append(newMessage);
        });
        
      });
}

function updateMessagesDisplay(roomId, members){
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
  if(message.files){
    addFileToMessage(message);
    
  }
}

function scrollDown(){
    window.scrollTo(0,$('#scrolled-block').scrollHeight);
}

function convertDate(stringDate){
  let d = new Date(stringDate);
  d = moment(d).calendar();
  return d;
}

/*function getImageSrc(apiUrl){
  /*xhr[messageId] = new XMLHttpRequest();
  xhr[messageId].open('GET', 'https://api.ciscospark.com/v1/contents/Y2lzY29zcGFyazovL3VzL0NPTlRFTlQvZmY4NDcwNDAtNmFmOS0xMWU3LWIwODItYjc2NjE4ZTcyNDcwLzA', true);
  xhr[messageId].setRequestHeader("Accept", "application/json");
  xhr[messageId].setRequestHeader("Content-Type", "application/json");
  xhr[messageId].setRequestHeader("Authorization", "Bearer NGJhMTkyNzMtMjIzZi00YjlkLTk3YTEtM2E3NzZjMGFhNWMyZWQzMDdiN2EtZmZi");
  //console.log(apiUrl);
  xhr[messageId].send();
  console.log('request sent!');
  xhr[messageId].onreadystatechange = function(){
    if(xhr[messageId].readyState == 4){
      //console.log(JSON.parse(xhr[messageId].responseText));
      console.log(xhr[messageId].status);
      console.log(xhr[messageId].getAllResponseHeaders());
    }
  }
  var pr;
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
      pr = Promise.resolve('data:image/png;base64,'+b64encoded);
    }
  };
  xhr[messageId].send(null);
  return pr;
  /*$.get(apiUrl,
      {"Accept" : "application/json",
      "Content-Type":"application/json",
      "Authorization": "Bearer "+"NGJhMTkyNzMtMjIzZi00YjlkLTk3YTEtM2E3NzZjMGFhNWMyZWQzMDdiN2EtZmZi"},
      (data)=>{
        console.log('GRAPEFRUIT');
        console.log(data);
      });

}*/

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
      //console.log(message.text);
      $('#'+messageId+' > img').attr('src', imageSrc);
    }
  }
  xhr[messageId].send(null);
}

// Sending a part info
$('#part-sent').on('click', (event) => {
  event.preventDefault();
  $('#message-input').val(JSON.stringify(window.PART));
  
});
