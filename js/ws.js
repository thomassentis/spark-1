var wsUri = "ws://localhost:12345";
window.loggedin = false;

window.onload = function() {
var socket = new WebSocket(wsUri);

socket.onclose = function()
{
    console.error("web channel closed");
};
socket.onerror = function(error)
{
    console.error("web channel error: " + error);
};

window.PART = {
  "id" : 0,
  "chance": 0.0
  "url" : ""
}

socket.onopen = function()
{
window.channel = new QWebChannel(socket, function(channel) {
       //connect to the changed signal of a property
	ch.objects.backend.rowsInserted.connect(function(args, b, c) {
            console.log('RowInserted:', args)
	    $('#part-sent').removeAttr('disabled')
        });


    //connect to a signal
    channel.objects.chatserver.keepAlive.connect(function(args) {
        if (window.loggedin) {
           //call a method
           channel.objects.chatserver.keepAliveResponse($('#loginname').val())
           console.log("sent alive");
        }
    });

    });
  }
}
