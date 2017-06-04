var expect = require('expect');

var {generateMessage, generateLocationMessage} = require('./message');

describe('generateMessage', () => {
  it('should generate correct message object', () => {
    var from = 'Vishal';
    var text = 'Some text';
    var message = generateMessage(from, text);

    expect(message.createdAt).toBeA('number');
    expect(message.from).toInclude(from);
    expect(message.text).toInclude(text);
  });
});

describe('generateLocationMessage', () => {
  it('should generate correct location object', () => {
    var from = 'Vishal';
    var latitude = 15;
    var longitude = 20;
    var url = 'https://www.google.com/maps?q=15,20';
    var locationMessage = generateLocationMessage(from, latitude, longitude);

    expect(locationMessage.createdAt).toBeA('number');
    expect(locationMessage).toInclude({
      from,
      latitude: locationMessage.latitude,
      longitude: locationMessage.longitude,
      url
    });
  });
});
