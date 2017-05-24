var socket = io();

socket.on('connect', function () {
  console.log('Connected to server');

  // socket.emit('createEmail', {
  //   to: 'john@statefarm.com',
  //   text: 'How is it going?'
  // });

  socket.emit('createMessage', {
    from: 'john@statefarm.com',
    text: 'Shashank is a sensitive guy'
  });
});

socket.on('disconnect', function () {
  console.log('Disconnected from server');
});

socket.on('newMessage', function (message) {
  console.log('New Message: ', message);
});

// socket.on('newEmail', function (email) {
//   console.log('New email', email);
// });
