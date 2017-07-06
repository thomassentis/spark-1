const $ = require('jquery');
const sparkService = require('./sparkService');

var roomSelect = $('#room-select');
var messagesBox = $('#messages-box');
var currentRoomId;

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
      displayMessages(roomSelect.value);
      $('#select-box').show();
      setInterval(()=>{displayMessages(currentRoomId);}, 4000);
      scrollDown();
  });
    
  
//alert(roomSelect.val());

});

roomSelect.on('change', function(){
  currentRoomId = roomSelect.val();
  
  displayMessages(currentRoomId)
  .then(()=>scrollDown());
});

$('#logout-button').on('click', () => {
  sparkService.logout();
});

$('#message-form').on('submit', (event) => {
  event.preventDefault();
  var message = $('#message-input').val();
  if(message){
    //var rooms = sparkService.getRooms(10);
    var currentRoomId = roomSelect.val();
    //alert(currentRoomId);
    sparkService.sendMessage(message, currentRoomId);
  }
    
  $('#message-input').val('');
  addLastMessage(currentRoomId);
  
  
});

function addLastMessage(roomId){
  return sparkService.promiseLastMessage(roomId).then((messages)=>{
        messagesBox.append('<p id="#last-message">'+messages.items[0].text+'</p>');
        }).then(()=>scrollDown());
}

function displayMessages(roomId){
  var newMessages = '';
  return sparkService.promiseMessages(roomId).then((messages)=>{
        messages.items.forEach((message)=>{
          newMessages = '<p>'+message.text+'</p>' + newMessages;
        });
        messagesBox.html(newMessages);
        //window.scrollTo(0,messagesBox.scrollHeight);
        //messagesBox.append('<p></p>');
      });
}

function scrollDown(){
    window.scrollTo(0,document.body.scrollHeight);
}