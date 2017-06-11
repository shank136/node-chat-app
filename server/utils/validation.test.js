const expect = require('expect');

var {isRealString} = require('./validation');

describe('isRealString', () => {
  it('should reject non-string values', () => {
    var str = 12345;
    var strResult = isRealString(str);
    expect(strResult).toBe(false);
  });

  it('should reject strings with only spaces', () => {
    var str = '    ';
    var strResult = isRealString(str);
    expect(strResult).toBe(false);
  });

  it('should allow string with non-space characters', () => {
    var str = '  LOTR  ';
    var strResult = isRealString(str);
    expect(strResult).toBe(true);
  });
});
