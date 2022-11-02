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
  const templateVars = {
    username: req.cookies["username"],
  };
  res.render("urls_new", templateVars);
});


//Read 

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"],
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

  const templateVars = {
    username: req.cookies["username"],
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

//Add new username and login

app.post("/login", (req, res) => {
  console.log("login req.body", req.body.username);
  const loginUser = req.body.username;

  res.cookie("username", loginUser);

  res.redirect("/urls");
});

//Logout 

app.post("/logout", (req, res) => {
  console.log("logout button pressed");
  res.clearCookie("username");
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