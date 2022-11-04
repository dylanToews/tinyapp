///Tiny app server 

const cookieParser = require('cookie-parser');
const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const {
  getUsersByEmail,
  generateRandomString,
  urlsForUser,
  checkEmailForDuplicates
} = require('./helpers');

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2', 'key3'],
  maxAge: 24 * 60 * 60 * 1000
}));



//// URL Database

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

/// User Database

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: '$2a$10$fX9z72ImfNpoqkwY/88WwecSXUc1waSofMeSasPgB6Z.0gKtYAdgu'
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: '$2a$10$X09nH4YWd7sjT5Z8PwsHzeQ7rFxP9c0Ng80DIRKm7Kjme3CbR8FUO'
  },
};


//Check email/password function 

const checkEmailPassword = (email, password, users) => {
  let userKeys = Object.keys(users);
  let userID = '';

  for (let keys of userKeys) {
    if (users[keys].email === email) {
      userID = keys;
    }
  }
  if (userID === '') {
    return false;
  }

  const hashedPassword = users[userID].hashedPassword;
  if (bcrypt.compareSync(password, hashedPassword)) {
    return userID;
  }
  return false;
};



///GETS & POSTS////



// Render registration page 

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_register", { user: null });
});


//Register new user

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email.length === 0 || password.length === 0) {
    res.status(400).send("Please fill all boxes before submitting");
    return;
  }
  if (checkEmailForDuplicates(email, users)) {
    res.status(400).send("Email has already been used, please choose another email");
    return;
  }

  users[id] = { id, email, hashedPassword };

  req.session.user_id = id;
  res.redirect("/urls");
});


// Render login page

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", { user: null });
});


// Login existing user

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (checkEmailForDuplicates(email, users) !== true) {
    res.status(403).send("Email cannot be found");
    return;
  }
  if (checkEmailPassword(email, password, users) === false) {
    res.status(403).send("Email does not match password");
    return;
  }
  req.session.user_id = checkEmailPassword(email, password, users);
  res.redirect("/urls");
});


//Logout user

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


// Render home/index page

app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const userDatabase = urlsForUser(id, urlDatabase);
  const templateVars = {
    urls: userDatabase,
    user,
  };

  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_index", templateVars);
});


// Render page for create new url 

app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = { user, };

  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});


// Create new short URL 

app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  if (!req.session.user_id) {
    res.send("Please log in");
    return;
  }
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls`);
});


// Short url hyperlink to long url website

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  if (!urlDatabase[req.params.id]) {
    res.send("The page you are looking for does not exist!");
  }
  if (!req.session.user_id) {
    res.send("Please login to view urls");
    return;
  }
  res.redirect(longURL);
});


//Render edit url page 

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const id = req.session.user_id;
  const user = users[id];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[shortURL].longURL
  };
  if (!req.session.user_id) {
    res.send("Please login to view urls");
    return;
  }
  if (id !== urlDatabase[shortURL].userID) {
    res.send("Sorry, you can only view urls that you own!");
    return;
  }
  res.render("urls_show", templateVars);
});


//Edit existing urls 

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.editURL;
  urlDatabase[shortURL] = {
    longURL,
    userID: req.session.user_id
  };
  res.redirect(`/urls`);
});


// Delete short URL 

app.post("/urls/:id/delete", (req, res) => {
  const id = req.session.user_id;
  const shortURL = req.params.id;
  if (id !== urlDatabase[shortURL].userID) {
    res.send("Sorry, you can only delete urls that you own!");
    return;
  }
  delete urlDatabase[shortURL];
  res.redirect("/urls");
}
);


// Redirect to home page 

app.get('/', (req, res) => {
  res.redirect("/urls");
});



app.listen(PORT, () => {
  console.log(`Example app listeneing on port ${PORT}`);
});