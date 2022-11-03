///Helper functions 



///returns object of user info based on email 

const getUsersByEmail = (email, database) => {
  let userLookup = {};
  let userKeys = Object.keys(database);
  for (let keys of userKeys) {
    let userEmail = database[keys].email;
    if (email === userEmail) {
      userLookup = database[keys];
    }
  }
  return userLookup;
};


function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
}


///locates specific urls associated with userIDs
const urlsForUser = (id, urlDatabase) => {
  let userDatabase = {};
  for (let keys in urlDatabase) {
    let userIdentifier = urlDatabase[keys].userID;
    let longURL = urlDatabase[keys].longURL;
    if (id === userIdentifier) {
      userDatabase[keys] = {
        longURL,
        userID: userIdentifier
      };
    }
  }
  return userDatabase;
};


const checkEmailForDuplicates = (enterEmail, users) => {
  let userKeys = Object.keys(users);
  for (let keys of userKeys) {
    let userEmail = users[keys].email;
    if (enterEmail === userEmail) {
      return true;
    }
  }
};
module.exports = { 
  getUsersByEmail,
  generateRandomString,
  urlsForUser,
  checkEmailForDuplicates
  }