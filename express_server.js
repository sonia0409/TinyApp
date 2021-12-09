const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");  // middleware added to accomodate POST request.
const { urlencoded } = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");


app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); // directs the obtained LongURL to urls as a JSON(parsed).

app.set("view engine", "ejs");  //connect with the files in view folder with .ejs




//data

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
//functions
//shortURL generated
const generateRandomString = function() {
  // return a string of 6 random alphanumeric characters
  const shortURL = Math.floor((1 + Math.random()) * 0x100000).toString(16);
  return shortURL;
};
//generate id - random numbers;
const generateRandomNumber = function() {
  const id = Math.floor((1 + Math.random()) * 3000);
  return id;
};
//find user by email
const findUserByEmail = (email) => {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

//find user by id; return -url
const urlsForUser = (id) => {
  const urlsWithSameUserID = {};
  for (const user in urlDatabase) {
    const url = urlDatabase[user];
    if (id === url.userID) {
      urlsWithSameUserID[user] = url;
    }
  }
  return {data: urlsWithSameUserID};
};

//check if id exists
const matchShortURL = (shortURL) => {
  for (const url in urlDatabase) {
    if (shortURL === url) {
      return shortURL;
    }
  }
  return null;
};


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json({ urlDatabase, users});
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});



app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const url = urlsForUser(id);
  console.log("url",url);
  if (url.error) {
    url.error = "true";
    return res.redirect("/login");
  }
  //if userID === user login id then display /urls page
  const templateVars = { urls: url.data, user: users[id] };
  res.render("urls_index", templateVars);

});




//route to direct to the registration form
app.get("/register", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("register", templateVars);
});

//route- handle the register post request
app.post("/register", (req, res) => {
  const id = generateRandomNumber();
  const email = req.body.email;
  const password = req.body.password;

  const hashedPassword = bcrypt.hashSync(password, 10)
  
  const passwordMatch = bcrypt.compareSync(password, hashedPassword) 

  //edge case- if email is empty - send 400 status code
  if (!email || !passwordMatch) {
    return res.status(400).send('email or password cannot be empty!!');
  }
  //edge case- if email already exists
  const user = findUserByEmail(email);

  if (user) {
    return res.status(400).send('this email already exists!!');
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
  const id = req.cookies.user_id;
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
  const id = req.cookies.user_id;
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: id };
  res.redirect(`/urls/${shortURL}`);

});

//shows HTML file with the shortURL and longURL
app.get("/urls/:shortURL", (req, res) => {
  const id = req.cookies.user_id;
  const shortURL = req.params.shortURL;

  const url = matchShortURL(shortURL);
  if (url) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    const templateVars = { shortURL: shortURL, longURL: longURL, user: users[id] };
    res.render("urls_show", templateVars);
  }
  if (!url) {
    res.status(400).send("this url doesnot exist");
  }

});

//redirecting the user to the longURL website
app.get("/u/:shortURL", (req, res) => {

  const shortURL = req.params.shortURL;
  const url = matchShortURL(shortURL);
  if (url) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  }
  if (!url) {
    res.status(400).send("this url doesnot exist");
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
  const id = req.cookies.user_id;
  const longURL = req.body.longURL;

  urlDatabase[shortURL] = { longURL: longURL, userID: id };
  res.redirect("/urls");
});

//login link renders new login page
app.get("/login", (req, res) => {
  const id = req.cookies.user_id;
  const templateVars = { urls: urlDatabase, user: users[id] };
  res.render("login", templateVars);
});
//route to connect with the login and collect the username cookie
app.post("/login", (req, res) => {

  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10)
  const passwordMatch = bcrypt.compareSync(password, hashedPassword) 

  if (!email || !passwordMatch) {
    return res.status(400).send("email and password cannot be blank");
  }

  const user = findUserByEmail(email);
  if (!user) {
    return res.status(403).send("email does not exist!");
  }

  if (!passwordMatch) {
    return res.status(403).send("password does not match!");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");

});

//route the loggout cookie to clear the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});