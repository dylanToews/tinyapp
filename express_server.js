//Set up express as a dependency 

const express = require('express');
const app = express();
const PORT = 8080;

//Tells express app to use EJS as its templating engine 

function generateRandomString() {
  let r = (Math.random() + 1).toString(36).substring(7);
  return r;
}

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("ok");
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Happy Halloweenie");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateId = req.params.id;
  const templateVars = { id: req.params.id, longURL: urlDatabase[templateId] };
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
  const templateVars = { gretting: "Hello World!!" };
  res.render("hello_world", templateVars);
});

app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
});

app.listen(PORT, () => {
  console.log(`Example app listeneing on port ${PORT}`);
});