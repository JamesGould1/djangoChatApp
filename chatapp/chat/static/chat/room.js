const roomName = window.roomName
let chatSocket = new WebSocket(
    'ws://' + window.location.hostname + ':8000/ws/chat/' + roomName + '/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);

    document.querySelector('#chat-log').innerHTML += 
        '<div class="message"><span class="username">' + data['username'] + ':</span><span class="message-text"> ' + data['message'] + '</span></div>';
}

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

function sendMessage() {
    const username = document.querySelector('#username-input').value.trim();
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value.trim();

    if (!username) {
        alert("Please enter a username!");
        return;
    }

    if (message) {
        chatSocket.send(JSON.stringify({
            'username': username,
            'message': message
        }));
        messageInputDom.value = '';
    }
}

document.querySelector('#chat-message-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        sendMessage(); 
    }
});

document.querySelector('#chat-message-input-btn').onclick = function() {
    sendMessage();
};