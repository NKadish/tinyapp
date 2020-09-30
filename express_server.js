const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookies = require("cookie-parser");
const dupeEmailChecker = require('./helperFuncs');
app.use(cookies());
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const generateRandomString = () => Math.random().toString(36).substring(2,8);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
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

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => { // send the code over to our templates
  const templateVars = { 
    id: req.cookies["user_id"],
    usersObj: users,
    urls: urlDatabase 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // for when we want to open the new url page 
  const templateVars = { 
    usersObj: users,
    id: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

app.post("/urls", (req, res) => { // when someone enters a url to be shortened, we generate a random string for it, then put it into the database and then redirect to the page associated
  const newID = generateRandomString();
  urlDatabase[newID] = req.body.longURL;
  res.redirect(`/urls/${newID}`);
});

app.get("/u/:shortURL", (req, res) => { // the actual functionality for using the short urls
  const longURL = urlDatabase[req.params.shortURL];
  if (longURL === undefined) { // if the url entered does not match one in the object, it 404s
    res.send('404, the URL you entered was incorrect, please try again');
  } else { // if it does match it redirects to the page for that url
    res.redirect(longURL);
  }
});

app.get("/urls/:shortURL", (req, res) => { // when they go to this link, it shows them the original url and the small version of it
  const templateVars = { 
    usersObj: users,
    id: req.cookies["user_id"],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL] 
  };
  res.render("urls_show", templateVars);
});

// lets the user edit the URL from the shortURL page, changing the URL asociated with the shortened version
app.post("/urls/:shortURL", (req, res) => { 
  urlDatabase[req.params.shortURL] = req.body.longURLEdit;
  res.redirect('/urls');
});

app.post('/urls/:shortURL/delete', (req, res) => { // Deletes the selected item from the object
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

// lets people login and saves their cookies
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

// lets people logout and deletes the cookie
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// the registration page
app.get("/register", (req, res) => {
  const templateVars = { 
    usersObj: users,
    id: req.cookies["user_id"] 
  };
  res.render("user_reg", templateVars);
});

// posts the new user into the users object and redirects
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if (dupeEmailChecker(users, req.body.email)) { // checks to see if the email alredy exists
    res.status(400);
    res.send('Error code 400: this email already exists in the database, please try again');
  } else if (req.body.email === '' || req.body.password === '') { // checks to see if the email fields are empty or not 
    res.status(400);
    res.send('Error code 400: username or passwords fields are empty, please try again');
  } else { // if there are no errors, it posts the new user 
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie('user_id', users[userID]['id']);
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  const templateVars = { 
    usersObj: users,
    id: req.cookies["user_id"] 
  };
  res.render("user_login", templateVars);
});