const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");  // middleware added to accomodate POST request.
const { urlencoded } = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, generateRandomString } = require("./helpers");


app.use(
  cookieSession({
    name: 'session',
    keys: [
      "Anything works for me",
      "I am super excited about my first app tiny app"
    ]
  })
);

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); // directs the obtained LongURL to urls as a JSON(parsed).

app.set("view engine", "ejs");  //connect with the files in view folder with .ejs


//shortURL - longURL; key-value pair
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

//users being stored
const users = {
  "id1": {
    id: "id1",
    email: "user1@example.com",
    password: bcrypt.hashSync("123", 10)
  },
  "id2": {
    id: "id2",
    email: "user2@example.com",
    password: bcrypt.hashSync("abcd", 10)
  }
};


app.get("/", (req, res) => {
  const { email } = req.body;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(403).send("Please login!!");
  }
  
});

app.get("/urls.json", (req, res) => {
  res.json({ urlDatabase, users });
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[id] };
  const user = users[id];
  if (user) {
    res.render("urls_index", templateVars);
  }
  if (!user) {
    return res.status(403).send("Please login!!");
  }
});

//route to direct to the registration form
app.get("/register", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("register", templateVars);
});

//route- handle the register post request
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { email, password } = req.body;
  //const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  const passwordMatch = bcrypt.compareSync(password, hashedPassword);
  //edge case- if email is empty - send 400 status code
  if (!email || !passwordMatch) {
    return res.status(400).send('email or password cannot be empty!!');
  }
  //edge case- if email already exists
  const user = getUserByEmail(email, users);
  if (user) {
    return res.status(400).send('this email already exists!! Please login');
  }
  users[id] = {
    id: id,
    email: email,
    password: hashedPassword
  };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

//this route will direct to the forms
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[id] };
  const user = users[id];
  if (user) {
    res.render("urls_new", templateVars);
  }
  if (!user) {
    return res.redirect("/login");
  }
});

//POST redirects to the HTML page.
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  const id = req.session.user_id;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: id };
  res.redirect(`/urls/${shortURL}`);

});

//shows HTML file with the shortURL and longURL
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    res.status(400).send("this url doesnot exist");
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    const templateVars = { shortURL: shortURL, longURL: longURL, user: users[id] };
    res.render("urls_show", templateVars);
  }
});

//redirecting the user to the longURL website
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[shortURL];
  if (!url) {
    res.status(400).send("this url doesnot exist");
  } else {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
});

//route to delete the urls
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//route to edit the longURL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const id = req.session.user_id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = { longURL: longURL, userID: id };
  res.redirect("/urls");
});

//login link renders new login page
app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("login", templateVars);
});

//route to connect with the login and collect the username cookie
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  //if email or password is empty
  if (!email || !password) {
    return res.status(400).send("email and password cannot be blank");
  }
  const user = getUserByEmail(email, users);
  const passwordMatch = bcrypt.compareSync(password, user.password);

  if (!user) {
    return res.status(403).send("email does not exist!");
  }
  if (!passwordMatch) {
    return res.status(403).send("password does not match!");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//route the loggout cookie to clear the cookie
app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});