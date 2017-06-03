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

  socket.emit('newMessage', {
    from: 'Admin',
    text: 'Welcome to the chat app',
    createdAt: new Date().getTime()
  });

  socket.broadcast.emit('newMessage', {
    from: 'Admin',
    text: 'New user just joined',
    createdAt: new Date().getTime()
  });


  socket.on('newMessage', (newMessage) => {
    console.log('newMessage', newMessage);
  });

  socket.on('createMessage', (createMessage) => {
    console.log('created message from client', createMessage);
    // io.emit('newMessage', {
    //   from: createMessage.from,
    //   text: createMessage.text,
    //   createdAt: new Date().getTime()
    // });
    socket.broadcast.emit('newMessage', {
      from: createMessage.from,
      text: createMessage.text,
      createdAt: new Date().getTime()
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
