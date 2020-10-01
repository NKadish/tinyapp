const { assert } = require('chai');

const dupeChecker = require('../helperFuncs.js');

const testUsers = {
  'userRandomID': {
    id: 'userRandomID', 
    email: 'user@example.com', 
    password: 'purple-monkey-dinosaur'
  },
  'user2RandomID': {
    id: 'user2RandomID', 
    email: 'user2@example.com', 
    password: 'dishwasher-funk'
  }
};

describe('dupeChecker', function() {
  it('should return the user associated with the email that we put in', function() {
    const user = dupeChecker(testUsers, 'email', 'user@example.com', true);
    const expectedOutput = 'userRandomID';
    assert.strictEqual(user, expectedOutput); 
  });

  it('Should return false if it can\'t find the email that we\'re looking for', function() {
    const user = dupeChecker(testUsers, 'email', 'user@gmail.com');
    assert.isFalse(user); 
  });

  it('Should return true if it can find the email that we\'re looking for', function() {
    const user = dupeChecker(testUsers, 'email', 'user@example.com');
    assert.isTrue(user); 
  });

  it('Should return false if it can\'t find the password that we\'re looking for', function() {
    const user = dupeChecker(testUsers, 'password', 'purple-monkey-dog');
    assert.isFalse(user); 
  });

  it('Should return true if it can find the password that we\'re looking for', function() {
    const user = dupeChecker(testUsers, 'password', 'purple-monkey-dinosaur');
    assert.isTrue(user); 
  });
});