const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");  // middleware added to accomodate POST request.
const { urlencoded } = require("body-parser");
const cookieParser = require("cookie-parser");

//Middleware
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
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username};
  res.render("urls_index", templateVars);
});

//this route will direct to the forms
app.get("/urls/new", (req, res) => {
  const username = req.cookies.username;
  const templateVars = { urls: urlDatabase, username};
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
  const username = req.cookies.username;
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username };
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

//route to connect with the login and collect the username cookie
app.post("/login", (req, res) => {
 
  const username = req.body.username;
  res.cookie('username', username )
  res.redirect("/urls")

});

//route the loggout cookie to clear the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("username")
  res.redirect("/urls")
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});