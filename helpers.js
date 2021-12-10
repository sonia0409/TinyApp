
const generateRandomString = function() {
  // return a string of 6 random alphanumeric characters
  const shortURL = Math.floor((1 + Math.random()) * 0x100000).toString(16);
  return shortURL;
};

const getUserByEmail = function(email, database) {
  for(const data in database){
    const user = database[data];
    if(user.email === email){
      return user;
    }
  }
  return null;
};

module.exports = { getUserByEmail, generateRandomString }