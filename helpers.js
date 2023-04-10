
const userLookup = (email, database) => {
  for (let userID in database) {
    if (database[userID].email === email) {
      return userID;
    }
  }
  return;
}

//helper for short url
const generateRandomString = () => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}

//returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser= function (id, database) {
  const userUrls = {};

  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
}

module.exports = {
  userLookup,
  generateRandomString,
  urlsForUser,
};