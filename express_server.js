//--------------Requirements---------------------
const cookieParser = require("cookie-parser");
const express = require("express");

//helper for short url
const generateRandomString = () => {
  let result = '';
  const char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 6; i++) {
    result += char.charAt(Math.floor(Math.random() * char.length));
  }
  return result;
}

//user lookup helper function 
const userLookup = (email, database) => {
  return Object.values(database).find(user => user.email === email);
}

//data store for users
const users = {
  user1: {
    id: "user1",
    email: "lauren@example.com",
    password: "1234",
  },
  user2: {
    id: "user2",
    email: "will@example.com",
    password: "3142"
  },
};

//database 
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK":  "http://www.google.com"
};

//------------Set Up/ Middlewear-----------
const PORT = 8080;
const app = express();

app.use(express.urlencoded({extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");





//-------------------GET-------------------

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//main page
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    user: users[req.cookies["user_id"]]
  };


  res.render("urls_index", templateVars);
});

//new url page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  }

  //if user is not logged in
  if (!templateVars.user) {
    res.redirect("/login");
  }

  res.render("urls_new", templateVars);
});

//show new id
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_shows", templateVars);
});

//redirect to url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const { id } = req.params;
  const selectedUrl = urlDatabase[id]

  //if user tries to access a shortened url that DNE
  if (!selectedUrl) {
    return res.status(404).send("Shortened URL not found :(");
  };

  res.redirect(longURL);
})

//registration page
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  //if user is already logged in
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };

  //if user is already logged in
  if (templateVars.user) {
    res.redirect("/urls");
  }
  res.render("urls_login", templateVars);
})


//-------------POST-------------

//register new uses
app.post('/register', (req, res) => {
  const user = {
    id: generateRandomString(),
    email: req.body.email,
    password: req.body.password,
  };
  //if user does not imput email and/or password 
  if (!user.email || !user.password) {
    res.status(400).send("Email and/or Password cannot be blank!")
  }
  
  //if user tries to register with an email that is already in our system
  if (userLookup(user.email, users)) {
    res.status(400).send("This email has already been used on our site.")
  }

  users[user.id] = user;
  console.log(users);
  
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

//
app.post("/urls", (req, res) => {
  console.log(req.body); //log the POST request body to the console
  const user = users[req.cookies["user_id"]];
  //is user hasn't logged in
  if (!user) {
    res.status(401).send("You must login to shorten a URL")
  }
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
});

//Login
app.post("/login", (req, res) => {
  console.log('req.body', req.body);
  const { email, password } = req.body;
  const user = userLookup(email, users);

  if (!user) {
    return res.status(403).send("Email not found.");
  };

  if (password != user.password) {
    return res.status(403).send("Password is incorrect!");
  };

  res.cookie("user_id", user.id);
  res.redirect("/urls");

});


app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/login');
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
