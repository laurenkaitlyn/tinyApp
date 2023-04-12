//--------------Requirements---------------------
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');
const { userLookup, generateRandomString, urlsForUser } = require("./helpers");


//data store for users
const users = {
  user1: {
    id: "user1",
    email: "lauren@example.com",
    password: "$2b$10$0J4eqL5cPAoGOZGI/VnSo./dw7PDAxOtG31SSWKn7s3M7YVTMXvaC", //123
  },
};

//database 
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1",
  },

  "9sm5xK":  {
    longURL: "http://www.google.com",
    userID: "user1",
  },
}

//------------Set Up/ Middlewear-----------
const PORT = 8080;
const app = express();

app.use(express.urlencoded({extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['secret', 'keys'],
  maxAge: 24 * 60 * 60 * 1000, //24hrs
  })
);

app.set("view engine", "ejs");


//=====================GET============================

app.get("/", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  } else {
    res.redirect("/urls");
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

//-----main page-------
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlsForUser(req.session.userID, urlDatabase),
    userID: req.session.userID,
    user: users[req.session.userID]
  };
  
  res.render("urls_index", templateVars);
});

//new url page - redirects if user is not logged in
app.get("/urls/new", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
  };

  const templateVars = {
    userID: req.session.userID,
    user: users[req.session.userID],
  };

  res.render("urls_new", templateVars);
});

//show new id with option to edit or error code if they try to change something that doesn't belong to their account
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;

  if (!urlDatabase[id]) {
    return res.status(403).send("This is not a valid link!");
  }

  if (req.session.userID !== urlDatabase[id].userID) {
    return res.status(403).send("You cannot edit this!");
  }

  const longURL = urlDatabase[id].longURL;

  const templateVars = {
    longURL: longURL,
    id: id,
    user: users[req.session.userID],
  };
  res.render("urls_shows", templateVars);
});

//redirects to url - sends error if user tries to access an id that DNE
app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[req.params.longURL];
  const selectedUrl = urlDatabase[id]

  if (!selectedUrl) {
    return res.status(404).send("Shortened URL not found :(");
  };

  res.redirect(longURL);
})

//registration page - redirects if user is logged in already
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.userID],
  };

  if (templateVars.user) {
    res.redirect("/urls");
  }

  res.render("urls_registration", templateVars);
});

// login page - redirects if user is already logged in
app.get("/login", (req, res) => {
  const templateVars = {
    userID: null,
    user: users[req.session.userID],
  };

  if (templateVars.user) {
    res.redirect("/urls");
  }

  res.render("urls_login", templateVars);
})


//===========================POST============================

// adds new shortened url - redirects user to login if they aren't
app.post("/urls", (req, res) => {

  if (!req.session.userID) {
    return res.redirect("/login");
  }
  
  const id = generateRandomString();
  const longURL = req.body.longURL

  urlDatabase[id] = { longURL: longURL, userID: req.session.userID };

  res.redirect(`/urls/${id}`);
});

//editing urls - only if it belongs to user
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;

  if (req.session.userID !== urlDatabase[id].userID) {
    return res.status(400).send("You are not authorized to edit :(");
  };

urlDatabase[id].longURL = req.body.newURL;
res.redirect("/urls");
});

//delete a url - only if it belongs to the user
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;

  if (req.session.userID === urlDatabase[id].userID) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    return res.status(400).send("You are not authorized to delete this url!");
  }
});


//Login - checks if they have valid login, redirects to urls if successful
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userID = userLookup(email, users);

  if (!email || !password) {
    return res.status(400).send("Email and/or password cannot be blank!")
  }
  
  if (!userID) {
    return res.status(403).send("Email not found.");
  };

  if (!bcrypt.compareSync(password, users[userID].password)) {
    res.status(403).send("Incorrect Password");
  }

  req.session.userID = userID;
  res.redirect("/urls");
});

//logout user - deletes thier cookies
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

//register new uses - checks if they filled in fields correctly, if we have an account with that email already, and hashes the password set up
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //if user does not input email or password
  if (!email|| !password) {
    return res.status(400).send("An email or password needs to be entered.") 
  } 
  userID = userLookup(email, password);

  if (userID) {
    return res.status(400).send("Email is already in use.")
  }

  const ID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  users[ID] = {
    id: ID,
    email,
    password: hashedPassword,
  };

  req.session.userID = ID;
  res.redirect("/urls")

});


//======================== Listener ======================
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
