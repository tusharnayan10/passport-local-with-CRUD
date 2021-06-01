if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');
const methodOverride = require('method-override');
const mongoose = require('mongoose');
// const Article = require('./db');
const initializePassword = require('./passport-config');
const { authenticate } = require('passport');

initializePassword(passport,
    email => user.find(user => user.email === email),
    id => user.find(user => user.id === id)
);

const app = express();
const user = [];

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(flash());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride('_method'));

// isAuthenticate or notAuthenticate funtion

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}


// MY DATABASE
mongoose.connect('mongodb://localhost:27017/wikiDB', { useNewUrlParser: true, useUnifiedTopology: true });


const articleSchema = new mongoose.Schema({ 
  title: String,
  content: String 
});

const Article = mongoose.model("Article", articleSchema);

const articles = new Article({
    title: "REST",
    content: "REST is lorem ipsum is a dummy text."
});
const articles1 = new Article({
    title: "HTML",
    content: "HTML is lorem ipsum is a dummy text."
});

// articles.save();
// articles1.save();


// ROUTING

app.get("/", checkAuthenticated, function (req, res) {
    res.render("index.ejs", { name: req.user.name });
});
// app.get("/article", checkAuthenticated, function (req, res) {
//     res.render("article.ejs");
// });
app.route("/register")
    .get(checkNotAuthenticated, function (req, res) {
        res.render("register.ejs");
    })
    .post(checkNotAuthenticated, async (req, res) => {
        try {
            const hashpass = await bcrypt.hash(req.body.password, 10);
            user.push({
                id: (Math.floor((Math.random() * 1234) * 5)).toString(),
                name: req.body.name,
                email: req.body.email,
                password: hashpass
            });
            res.redirect("/login")
        } catch {
            res.redirect("/register")
        }
        console.log(user);
    });

// LOGIN //
app.route("/login")
    .get(checkNotAuthenticated, function (req, res) {
        res.render("login.ejs");
    })
    .post(checkNotAuthenticated, passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true
    }));

// SIGN OUT //

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
});

// END AUTHENTICATION

// CRUD OPERATION // 
app.get("/articles",function(req,res){
    Article.find(function(err,foundArticle){
      if(!err){
        res.render("articles",{founds: foundArticle});
      }
      else{
        console.log(err);
      }
    });
  });
app.post("/articlesPost",function(req,res){
    console.log(req.body.title);
    console.log(req.body.content);
    const newArticle = new Article({
      title: req.body.title,
      content: req.body.content
      });
  
      newArticle.save(function(err){
        if(!err){
          res.redirect("/articles");
        }else{
          res.send(err);
        }
      });
  });
app.get("/articlesDelete",function(req,res){
    Article.deleteMany(function(err){
      if(!err){
          res.redirect("/articles");
      }else{
        res.send(err);
      }
    });
  });
app.post("/articlesPUT",function(req,res){
    Article.updateOne(
      {title: req.body.titleold},
      {title: req.body.title,content: req.body.content},
      {overwrite: true},
      function(err){
        if(!err){
            res.redirect("/articles");
        }
      }
      );
  })

//   POSTMAN SOFTWARE TEST 
app.route("/articles/:articleTitle")
  .get(function(req,res){
    // console.log(req.params.articleTitle);
      Article.findOne({title: req.params.articleTitle}, function(err, foundArticle){
        if(foundArticle){
          res.send(foundArticle);
        }else{
          res.send("No matching article found");
        }
      });
  })
  .put(function(req,res){
    Article.updateOne(
      {title: req.params.articleTitle},
      {title: req.body.title,content: req.body.content},
      {overwrite: true},
      function(err){
        if(!err){
          res.send("Great Success !!");
        }
      }
      );
  })
  .patch(function(req,res){
    Article.updateOne(
      {title: req.params.articleTitle},
      {$set: req.body},
      function(err){
        if(!err){
          res.send("Great Success !");
        }else{
          res.send(err);
        }
      } 
    );
  })
  .delete(function(req,res){
    Article.deleteOne(
      {title: req.params.articleTitle},
      function(err){
        if(!err){
          res.send("Great Success...");
        }else{
          res.send(err);
        }
      }
      );
  });





const PORT = 3000 || process.env.PORT
app.listen(PORT, function () {
    console.log("Server running on port " + PORT);
});