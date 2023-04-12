const { assert } = require('chai');

const { userLookup } = require('../helpers.js');

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

describe('userLookup', function() {
  it('should return a user with valid email', function() {
    const user = userLookup("user@example.com", testUsers)
    const expectedUserID = "userRandomID";
    assert.strictEqual(user, expectedUserID);
  });

  it('should return undefined if input an email not in the database', function() {
    const user = userLookup("user@ex.com", testUsers)
    assert.isUndefined(user);
  });
});

