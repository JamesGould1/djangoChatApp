const roomName = window.roomName
let chatSocket = new WebSocket(
    'ws://' + window.location.hostname + ':8000/ws/chat/' + roomName + '/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.type === 'message') {
    document.querySelector('#chat-log').innerHTML += 
        '<div class="message"><span class="username">' + data['username'] + ':</span><span class="message-text"> ' + data['message'] + '</span></div>';}
        else if (data.type === 'drawing') {
            drawOnCanvas(data); // Call function to draw on canvas
        }
};

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
        event.preventDefault(); // Prevent the default behavior (new line)
        sendMessage(); // Send the message
    }
});

// Trigger send message function when the Send button is clicked
document.querySelector('#chat-message-input-btn').onclick = function() {
    sendMessage();
};

// Drawing functionality
const canvas = document.getElementById("draw-canvas");
const ctx = canvas.getContext("2d");
let drawing = false;

// Start drawing
canvas.addEventListener("mousedown", startDrawing);
canvas.addEventListener("mousemove", draw);
canvas.addEventListener("mouseup", stopDrawing);
canvas.addEventListener("mouseout", stopDrawing);

// Start drawing function
function startDrawing(event) {
    drawing = true;
    draw(event); // Start drawing immediately when mouse is pressed
}

// Draw function
function draw(event) {
    if (!drawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "black";

    ctx.lineTo(x, y);
    ctx.stroke();

    // Send drawing data to the server
    chatSocket.send(JSON.stringify({
        'type': 'drawing',
        'x': x,
        'y': y,
        'lineWidth': 5,
        'strokeStyle': "black"
    }));
}

// Stop drawing
function stopDrawing() {
    drawing = false;
    ctx.beginPath(); // Reset path after drawing
}

// Function to draw received data on the canvas
function drawOnCanvas(data) {
    ctx.lineWidth = data.lineWidth;
    ctx.strokeStyle = data.strokeStyle;
    ctx.lineTo(data.x, data.y);
    ctx.stroke();
}