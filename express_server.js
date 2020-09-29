const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

const generateRandomString = () => Math.random().toString(36).substring(2,8);

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => { // for when we want to open the new url page 
  res.render("urls_new");
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
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});