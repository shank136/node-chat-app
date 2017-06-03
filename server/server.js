const http = require('http');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');

const {generateMessage} = require('./utils/message');
const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  socket.emit('newMessage', generateMessage('Admin', 'Welcome to the chat app'));

  socket.broadcast.emit('newMessage', generateMessage('Admin', 'New user just joined'));

  socket.on('newMessage', (newMessage) => {
    console.log('newMessage', newMessage);
  });

  socket.on('createMessage', (createMessage) => {
    console.log('created message from client', createMessage);
    io.emit('newMessage', generateMessage(createMessage.from, createMessage.text));
    //socket.broadcast.emit('newMessage', generateMessage(createMessage.from, createMessage.text));
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
