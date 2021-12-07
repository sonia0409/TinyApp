const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

function generateRandomString() {
  // return a string of 6 random alphanumeric characters
  const shortURL = Math.floor((1 + Math.random()) * 0x1000000).toString(16).substring(1);
  return shortURL;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/",(req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n")
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//this route will direct to the forms
app.get("/urls/new", (req, res) => {
  res.render("urls_new")
})


app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {shortURL: req.params.shortURL, longURL: 'What goes here?' };
  res.render("urls_show", templateVars);
});
//POST return a string 'OK' to browser and longURL to the server.
app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});
app.get("/u/:shortURL", (req, res) => {
  //const longURL =
  res.redirect(longURL);
})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`)
})