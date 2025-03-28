import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Get room name from URL
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from WebSocket
    async def receive(self, text_data):
        text_data_json = json.loads(text_data)
        if text_data_json["type"] == 'message':
            username = text_data_json['username']
            message = text_data_json['message']

        # Send message to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'chat_message',
                    'username': username,
                    'message': message
                }
            )
        elif text_data_json["type"] == "drawing":
            x = text_data_json["x"]
            y = text_data_json["y"]
            lineWidth = text_data_json["lineWidth"]
            strokeStyle = text_data_json["strokeStyle"]

            # Broadcast drawing data to room group
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    'type': 'drawing_data',
                    'x': x,
                    'y': y,
                    'lineWidth': lineWidth,
                    'strokeStyle': strokeStyle
                }
            )


    # Receive message from room group
    async def chat_message(self, event):
        username = event['username']
        message = event['message']

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'message': message,
            'username': username
        }))
    
    async def drawing_data(self, event):
        x = event['x']
        y = event['y']
        lineWidth = event['lineWidth']
        strokeStyle = event['strokeStyle']

        # Send drawing data to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'drawing',
            'x': x,
            'y': y,
            'lineWidth': lineWidth,
            'strokeStyle': strokeStyle
        }))

