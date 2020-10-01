const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const dupeChecker = require('./helperFuncs');
const bcrypt = require('bcrypt');

app.use(cookieSession({
  name: 'session',
  keys: ['key1']
}));

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs');

const generateRandomString = () => Math.random().toString(36).substring(2,8);

const urlDatabase = {};

const users = {};

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`tinyApp listening on port ${PORT}!`);
});

app.get('/urls', (req, res) => { // send the code over to our templates
  const templateVars = { 
    id: req.session['user_id'],
    usersObj: users,
    urls: urlDatabase 
  };
  res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => { // for when we want to open the new url page 
  const templateVars = { 
    usersObj: users,
    id: req.session['user_id']
  };
  res.render('urls_new', templateVars);
});

app.post('/urls', (req, res) => { // when someone enters a url to be shortened, we generate a random string for it, then put it into the database and then redirect to the page associated
  const newID = generateRandomString();
  if (users[req.session['user_id']] === undefined ) {
    res.redirect('/login');
  } else {
    urlDatabase[newID] = {longURL: req.body.longURL, userID: users[req.session['user_id']].id};
    res.redirect(`/urls/${newID}`);
  }
});

app.get('/u/:shortURL', (req, res) => { // the actual functionality for using the short urls
  if (urlDatabase[req.params.shortURL].longURL === undefined) { // if the url entered does not match one in the object, it 404s
    res.send('404, the URL you entered was incorrect, please try again');
  } else { // if it does match it redirects to the page for that url
    res.redirect(urlDatabase[req.params.shortURL].longURL);
  }
});

// when they go to this link, it shows them the original url and the small version of it
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = { 
    usersObj: users,
    id: req.session['user_id'],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL,
    songUserID: urlDatabase[req.params.shortURL].userID
  };
  res.render('urls_show', templateVars);
});

// lets the user edit the URL from the shortURL page, changing the URL asociated with the shortened version
app.post('/urls/:shortURL', (req, res) => { 
  if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURLEdit;
    res.redirect('/urls');
  } else {
    res.send('Error! That link doesn\'t belong to you! You can\'t edit it!');
  }
});

// Deletes the selected item from the object
app.post('/urls/:shortURL/delete', (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session['user_id']) {
    delete urlDatabase[req.params.shortURL];
  } else {
    res.send('Error! That link doesn\'t belong to you! You can\'t delete it!');
  }
  res.redirect('/urls');
});

// lets people logout and deletes the cookie
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// the registration page
app.get('/register', (req, res) => {
  const templateVars = { 
    usersObj: users,
    id: req.session['user_id'] 
  };
  res.render('user_reg', templateVars);
});

// posts the new user into the users object and redirects
app.post('/register', (req, res) => {
  const userID = generateRandomString();
  if (dupeChecker(users, 'email', req.body.email)) { // checks to see if the email alredy exists
    res.status(400);
    res.send('Error code 400: this email already exists in the database, please try again');
  } else if (req.body.email === '' || req.body.password === '') { // checks to see if the email fields are empty or not 
    res.status(400);
    res.send('Error code 400: email or passwords fields are empty, please try again');
  } else { // if there are no errors, it posts the new user 
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session['user_id'] = users[userID]['id'];
    res.redirect('/urls');
  }
});

// gets the login page
app.get('/login', (req, res) => {
  const templateVars = { 
    usersObj: users,
    id: req.session['user_id'] 
  };
  res.render('user_login', templateVars);
});

// login functionality, if the email doesn't match one that we have stored if gives an error
// if the password isn't right it gives an error 
// if the email and password are correct it sets the cookie to the one associated with the email and pass 
app.post('/login', (req, res) => {
  if (dupeChecker(users, 'email', req.body.email) === false) {
    res.status(403);
    res.send('Error code 403: The email entered does not match any in our database, please try again');
  } else if (bcrypt.compareSync(req.body.password, users[users[dupeChecker(users, 'email', req.body.email, true)].id].password) === false) {
    res.status(403);
    res.send('Error code 403: Incorrect password, please try again');
  } else if (dupeChecker(users, 'email', req.body.email) && bcrypt.compareSync(req.body.password, users[users[dupeChecker(users, 'email', req.body.email, true)].id].password)) {
    req.session['user_id'] = users[dupeChecker(users, 'email', req.body.email, true)].id;
    res.redirect('/urls');
  }
});