const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");  // middleware added to accomodate POST request.
const { urlencoded } = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true })); // directs the obtained LongURL to urls as a JSON(parsed).

app.set("view engine", "ejs");  //connect with the files in view folder with .ejs

//shortURL generated
const generateRandomString = function() {
  // return a string of 6 random alphanumeric characters
  const shortURL = Math.floor((1 + Math.random()) * 0x100000).toString(16);
  return shortURL;
};

//shortURL - longURL; key-value pair
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//users being stored
const users = {
  "id1": {
    id: "id1",
    email: "user1@example.com",
    password: "123"
  },
  "id2": {
    id: "id2",
    email: "user2@example.com",
    password: "abcd"
  }
};

//generate id - random numbers;
const generateRandomNumber = function() {
const id = Math.floor((1 + Math.random()) * 3000);
return id;
};

//find user by email
const findUserByEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email){
      return user;
    }
  }
  return null;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[id]};
  res.render("urls_index", templateVars);
});

//route to direct to the registration form
app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[id]};
  res.render("register", templateVars)
});

//route- handle the register post request
app.post("/register", (req, res) => {
  const id = generateRandomNumber();
  const email = req.body.email;
  const password = req.body.password;
  
  //edge case- if email is empty - send 400 status code
  if(!email || !password){
    return res.status(400).send('email or password cannot be empty!!');
  }
  //edge case- if email already exists
  const user = findUserByEmail(email);
  
  if(user){
    return res.status(400).send('this email already exists!!')
  }

  users[id]= {
    id: id,
    email: email,
    password: password
  };
  res.cookie("user_id", id)
  res.redirect("/urls");
});


//this route will direct to the forms
app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[id]};
  res.render("urls_new", templateVars);
});

//POST redirects to the HTML page.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);

});

//shows HTML file with the shortURL and longURL
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[id]};
  res.render("urls_show", templateVars);
});
//redirecting the user to the lonURL website
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//route to delete the urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//route to update the longURL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect("/urls");
});

//login link renders new login page
app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[id]};
  res.render("login", templateVars)
});
//route to connect with the login and collect the username cookie
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;

  if(!email || !password){
    return res.status(400).send("email and password cannot be blank")
  }
  
  const user = findUserByEmail(email)
  
  if(!user){
    return res.status(403).send("email does not exist!");
  }
  
  if(user.password !== password){
    return res.status(403).send("password does not match!")
  }


  res.cookie("user_id", user.id)
  res.redirect("/urls");

});

//route the loggout cookie to clear the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls")
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});