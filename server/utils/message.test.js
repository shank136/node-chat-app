var expect = require('expect');

var {generateMessage} = require('./message');

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
