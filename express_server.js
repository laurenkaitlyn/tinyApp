//--------------Requirements---------------------
const express = require("express");
const bcrypt = require("bcryptjs");
const cookieSession = require('cookie-session');

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
  for (let userID in users) {
    if (users[userID].email === email) {
      return userID;
    }
  }
  return;
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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "user1",
  },

  "9sm5xK":  {
    longURL: "http://www.google.com",
    userID: "user2",
  },
}

//returns the URLs where the userID is equal to the id of the currently logged-in user
const urlsForUser= function (id, database) {
  const userUrls = {};

  for (let shortURL in database) {
    if (database[shortURL].userID === id) {
      userUrls[shortURL] = database[shortURL];
    }
  }
  return userUrls;
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
  res.send("Hello!");
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
  if (!templateVars.user) {
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

  const templateVars = {
    longURL: longURL,
    id: id,
    user: users[req.session.userID],
  };
  res.render("urls_shows", templateVars);
});

//redirects to url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  const { id } = req.params;
  const selectedUrl = urlDatabase[id]

  //if user tries to access a shortened url that DNE
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
    user: users[req.session.userID],
    userID: null,
  };

  if (templateVars.user) {
    res.redirect("/urls");
  }

  res.render("urls_login", templateVars);
})


//===========================POST============================

//register new uses - checks if they filled in fields correctly, if we have an account with that email already, and hashes the password set up
app.post('/register', (req, res) => {

  const { email, password } = req.body;
  //if user does not input email or password
  if (!email|| !password) {
    return res.status(400).send("An email or password needs to be entered.") 
  } 
  
  if (userLookup(email, users)) {
    return res.status(400).send("Email is already in use.")
  }

  const ID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);

  users[ID] = {
    id: ID,
    email: req.body.email,
    password: hashedPassword,
  };

  req.session.userID = ID;
  res.redirect("/urls")

});

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
  const { id } = req.params;

  if (req.session.userID !== urlDatabase[id].userID) {
    return res.status(400).send("You are not authorized to edit :(");
  };

urlDatabase[id].longURL = req.body.newURL;
res.redirect("/urls");
});

//delete a url - only if it belongs to the user
app.post("/urls/:id/delete", (req, res) => {
  const { id } = req.params;

  if (req.session.userID === urlDatabase[id].userID) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    return res.status(400).send("Unauthorized request");
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
  res.session = null;
  res.redirect('/login');
});


//======================== Port Listener ======================
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
