//Sets up express, port, encoding etc. 

const cookieParser = require('cookie-parser');
const { response } = require('express');
const express = require('express');
const app = express();
const PORT = 8080;
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



/// FUNCTIONS 

function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
}



//// DATABASE


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};





/// BREAD (GETS & POSTS)


//Browse 

// redirect 

app.get('/', (req, res) => {
  res.redirect("/urls");
});

//Browse 

app.get("/urls/new", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];

  const templateVars = {
    user,
  };
  res.render("urls_new", templateVars);
});


//Read 

app.get("/urls", (req, res) => {
  const id = req.cookies.user_id;
  const user = users[id];

  const templateVars = {

    urls: urlDatabase,
    user,
  };
  res.render("urls_index", templateVars);
});

//Read 

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  console.log(longURL);
  res.redirect(longURL);
});

//Edit existing from index page 

app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const id = req.cookies.user_id;
  const user = users[id];

  const templateVars = {
    user,
    id: req.params.id,
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});


//edit

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.editURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls`);
});

//app.post("urls/:id", (req))




// Add new URL 

app.post("/urls", (req, res) => {
  console.log(req.body.longURL);
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//Login 1 

// app.post("/login", (req, res) => {
//   console.log("login req.body", req.body.username);
//   const loginUser = req.body.username;

//   res.cookie("username", loginUser);

//   res.redirect("/urls");
// });

//Logout 

app.post("/logout", (req, res) => {
  console.log("logout button pressed");
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Registration GET

app.get("/register", (req, res) => {

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

/// USERS 

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "e",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Check email/password

const checkEmailPassword = (email, enterPassword) => {

  let userKeys = Object.keys(users);
  for (let keys of userKeys) {
    let allEmails = users[keys].email;
    let myId;
    if (allEmails === email) {
      myId = keys;
    }
    let myObj = users[myId];

    if (Object.values(myObj).includes(enterPassword)) {
      return myId;
    }
    return false;
  }
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


  users[id] = { id, email, password };
  res.cookie("user_id", id);
  //res.redirect("/register")
  res.redirect("/urls");
});

// Login Page

app.get("/login", (req, res) => {

  res.render("urls_login", { user: null });
});


// Login Post 
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = req.body.id;

  if (checkEmailForDuplicates(email) !== true) {
    res.status(403).send("Email cannot be found");
    return;
  }

  if (checkEmailPassword(email, password) === false) {
    res.status(403).send("Email does not match password");
    return;
  }
  res.cookie("user_id", checkEmailPassword(email, password));
  res.redirect("/urls");
});



// DELETE 

app.post("/urls/:id/delete", (req, res) => {
  //console.log('delete button pressed');
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
}
);

















app.listen(PORT, () => {
  console.log(`Example app listeneing on port ${PORT}`);
});