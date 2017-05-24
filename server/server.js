const http = require('http');
const path = require('path');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../public');
const port = process.env.PORT || 3000;
var app = express();
var server = http.createServer(app);
var io = socketIO(server);

app.use(express.static(publicPath));

io.on('connection', (socket) => {
  console.log('New user connected');

  // socket.emit('newEmail', {
  //   from: 'mike@example.com',
  //   text: 'hey, what is going on',
  //   createdAt: 321
  // });
  //
  // socket.on('createEmail', (newEmail) => {
  //   console.log('createEmail', newEmail);
  // });

  socket.emit('newMessage', {
    from: 'SidSuryanarayanan@Colostate.edu',
    text: 'PhD requires a lot of self motivation',
    createdAt: '11-19-14'
  });

  socket.on('newMessage', (newMessage) => {
    console.log('newMessage', newMessage);
  });

  socket.on('createMessage', (createMessage) => {
    console.log('created message from client', createMessage);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
