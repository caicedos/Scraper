// Dependencies
var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Scraping tools
var cheerio = require("cheerio");
var axios = require("axios");

// Require all models
var db = require("./models");

// Initialize Express
var PORT = process.env.PORT || 3000;

var app = express();

// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({
  extended: true
}));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));


// Handlebars
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");



// Routes
app.get("/", function (req, res) {
  res.send("/public/index.html");
});


app.get("/scrape", function (req, res) {

  axios.get("https://www.apnews.com/").then(function (response) {

    var $ = cheerio.load(response.data);

    $(".FeedCard").each(function (i, element) {

      var title = $(element).find("h1").text();
      var summary = $(element).find("p").text();
      var href = $(element).find(".headline").attr('href');
   
      var link = `https://www.apnews.com${href}`;

      var result = {
        title: title,
        link: link,
        summary: summary,
        isSaved: false
      }

      console.log(summary);

      db.Article.findOne({
        title: title
      }).then(function (data) {

        console.log(data);

        if (data === null) {

          db.Article.create(result).then(function (dbArticle) {
            res.json(dbArticle);
          });
        }
      }).catch(function (err) {
        res.json(err);
      });

    });

  });
});

app.get("/articles", function (req, res) {

  db.Article
    .find({}).limit(25)
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/articles/:id", function (req, res) {

  db.Article
    .findOne({
      _id: req.params.id
    })
    .populate("note")
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.post("/articles/:id", function (req, res) {

  db.Note
    .create(req.body)
    .then(function (dbNote) {
      return db.Article.findOneAndUpdate({
        _id: req.params.id
      }, {
        note: dbNote._id
      }, {
        new: true
      });
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.put("/saved/:id", function (req, res) {

  db.Article
    .findByIdAndUpdate({
      _id: req.params.id
    }, {
      $set: {
        isSaved: true
      }
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.get("/saved", function (req, res) {

  db.Article
    .find({
      isSaved: true
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

app.put("/delete/:id", function (req, res) {

  db.Article
    .findByIdAndUpdate({
      _id: req.params.id
    }, {
      $set: {
        isSaved: false
      }
    })
    .then(function (dbArticle) {
      res.json(dbArticle);
    })
    .catch(function (err) {
      res.json(err);
    });
});

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoHeadlines";
mongoose.Promise = Promise;
// Connect to the Mongo DB
mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true
});


// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
