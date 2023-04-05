//express
const cookieParser = require("cookie-parser");
const express = require("express");

//port
const PORT = 8080;
const app = express();

app.use(express.urlencoded({extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");

//helper
const generateRandomString = () => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}

//database 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK":  "http://www.google.com"
};

//-------------POST-------------

//
app.post("/urls", (req, res) => {
  console.log(req.body); //log the POST request body to the console
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

//adding new url
app.post("/urls/:id", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL;
  res.redirect('/urls');
});

//delete a url
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//edit
app.post("/urls/:id/edit", (req, res) => {
  let longURL = req.body.longURL;
  urlDatabase[req.params.id] = longURL
  res.redirect("/urls");
})

//Login
app.post("/login", (req,res) => {
  console.log('req.body', req.body);
  const username = req.body.username;
  
  //if left balnk
  if (!username) {
    return res.status(400).send("username cannot be blank");
  }

  res.cookie('username', username);
  res.redirect('/urls');
})

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/urls.json", (req, res) => {
//   res.json(urlDatabase);
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

//-------------------GET-------------------

//main page
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"]};
    
  res.render("urls_index", templateVars);
});

//new url page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//show new id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_shows", templateVars);
});

//
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
})



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
