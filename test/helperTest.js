const { assert } = require('chai');

const { getUsersByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUsersByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert(user.id === expectedUserID);
  });
});

describe('check for missing email', function() {
  it('should return undefined if a non existant email is entered', function() {
    const user = getUsersByEmail("badbad@notgood.com", testUsers);
    assert(user.id === undefined);
  });
});

