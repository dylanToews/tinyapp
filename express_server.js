//Set up express as a dependency 

const express = require('express');
const app = express();
const PORT = 8080;


///Unsure of what exactly this urlDatabase does at the momement
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get('/', (req, res) => {
  res.send("Happy Halloweenie");
});

app.listen(PORT, () => {
  console.log(`Example app listeneing on port ${PORT}`);
});