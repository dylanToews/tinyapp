//Sets up express, port, encoding etc. 

const cookieParser = require('cookie-parser');
const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;
const bcrypt = require("bcryptjs");

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



/// FUNCTIONS 

function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
}





/// BREAD (GETS & POSTS)


//GET Redirect to home page 

app.get('/', (req, res) => {
  res.redirect("/urls");
});

//GET Create New URL

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    user,
  };
  if (!req.cookies.user_id) {
    res.redirect("/login");
    return;
  }
  res.render("urls_new", templateVars);
});


//GET - Render home/index page

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];

  if (!req.cookies.user_id) {
    res.send("Please login to view urls");
    return;
  }

  const userDatabase = urlsForUser(id);

  const templateVars = {

    urls: userDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

// Function to returns correct URLS for User

const urlsForUser = (id) => {

  let userDatabase = {};
  for (let keys in urlDatabase) {
    let userIdentifier = urlDatabase[keys].userID;
    let longURL = urlDatabase[keys].longURL;
    if (id === userIdentifier) {
      userDatabase[keys] = {
        longURL,
        userID: userIdentifier
      };
    }
  }
  return userDatabase;

};



//GET - link from short url to actual long url 

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!urlDatabase[req.params.id]) {
    res.send("The page you are looking for does not exist!");
  }
  if (!req.cookies.user_id) {
    res.send("Please login to view urls");
    return;
  }
  console.log(longURL);
  res.redirect(longURL);
});

//GET - go to edit url page 

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const id = req.cookies.user_id;
  const user = users[id];
  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[shortURL].longURL
  };
  if (!req.cookies.user_id) {
    res.send("Please login to view urls");
    return;
  }
  if (id !== urlDatabase[shortURL].userID) {
    res.send("Sorry, you can only view urls that you own!");
    return;
  }



  res.render("urls_show", templateVars);
});


//POST - edit existing urls 

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.editURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});



// Add new URL POST

app.post("/urls", (req, res) => {
  //console.log(req.body.longURL);
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  if (!req.cookies.user_id) {
    res.send("Please log in");
    return;
  }
  urlDatabase[shortURL] = {
    longURL,
    userID: req.cookies.user_id
  };
  res.redirect(`/urls`);
});


//// DATABASE

let urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },

  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  }
};

//Logout POST

app.post("/logout", (req, res) => {
  console.log("logout button pressed");
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Registration GET

app.get("/register", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_register", { user: null });
});


//Check Email Function 
const checkEmailForDuplicates = (enterEmail) => {
  let userKeys = Object.keys(users);
  for (let keys of userKeys) {
    let userEmail = users[keys].email;
    if (enterEmail === userEmail) {
      return true;
    }
  }
};

/// Users Data Object

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

//Check email/password Function 

const checkEmailPassword = (email, enterPassword, users) => {


  let userKeys = Object.keys(users);
  let myId = '';
  for (let keys of userKeys) {

    let allEmails = users[keys].email;
    if (allEmails === email) {
      myId = keys;
    }
  }
  if (myId === '') {
    return false;
  }

  let myObj = users[myId];

  const hashedPassword = users[myId].hashedPassword;
  if (bcrypt.compareSync(enterPassword, hashedPassword)) {
    return myId;
  }
  return false;

};



//Registration POST 
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;

  if (email.length === 0 || password.length === 0) {
    res.status(400).send("Please fill all boxes before submitting");
    return;
  }
  if (checkEmailForDuplicates(email)) {
    res.status(400).send("Email has already been used, please choose another email");
    return;
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  users[id] = { id, email, hashedPassword };

  console.log(users[id]);

  res.cookie("user_id", id);
  res.redirect("/urls");
});

// Login Page GET

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect("/urls");
    return;
  }
  res.render("urls_login", { user: null });
});


// Login POST
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;


  if (checkEmailForDuplicates(email) !== true) {
    res.status(403).send("Email cannot be found");
    return;
  }

  if (checkEmailPassword(email, password, users) === false) {
    res.status(403).send("Email does not match password");
    return;
  }
  res.cookie("user_id", checkEmailPassword(email, password, users));
  res.redirect("/urls");
});



// Delete short url POST 

app.post("/urls/:id/delete", (req, res) => {
  //console.log('delete button pressed');

  const id = req.cookies.user_id;
  const shortURL = req.params.id;
  if (id !== urlDatabase[shortURL].userID) {
    res.send("Sorry, you can only delete urls that you own!");
    return;
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
}
);

















app.listen(PORT, () => {
  console.log(`Example app listeneing on port ${PORT}`);
});