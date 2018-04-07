//Dependencies
const express = require("express");
const bodyParser = require("body-parser");
const logger = require("morgan");
const mongoose = require("mongoose");

//Scraping Tools
const axios = require("axios");
const cheerio = require("cheerio");

//Models
const db = require("./models");

//Port
const PORT = 8080;

//Express
let app = express();

//Middleware
app.use(logger("dev"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

//Connect to Mongo Database
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/PutANameHere",{
	useMongoClient: true
});

//GET Route to scrape NatGeo
app.get("/scrape", function(request, response){
	axios.get("https://www.nationalgeographic.com/").then(function(response){
		let $ = cheerio.load(response.data);
		$("article h2").each(function(i, element){
			let result = {};
			result.title = $(this)
				.children("a")
				.text();
			result.link = $(this)
				.children("a")
				.attr("href");

			db.Article.create(result)
				.then(function(dbArticle){
					console.log(dbArticle);
				})
				.catch(function(error){
					return response.json(error);
				});
		});
		response.send("Scrape Complete");
	});
});

//GET Route for articles
app.get("/articles", function(request, response){
	db.Article.find({})
		.then(function(dbArticle){
			response.json(dbArticle);
		})
		.catch(function(error){
			response.json(error);
		});
});

//GET Route for specific id
app.get("articles/:id", function(request, response){
	db.Article.findOne({_id: request.params.id})
	.populate("note")
	.then(function(dbArticle){
		response.json(dbArticle);
	})
	.catch(function(error){
		response.json(error);
	});
});

//POST Route for notes
app.post("/articles/:id", function(request, response){
	db.Note.create(request.body)
	.then(function(dbNote){
		return db.Article.findOneAndUpdte({_id: request.params.id}, {note: dbNote._id}, {new:true});
	})
	.then(function(dbArticle){
		response.json(dbArticle);
	})
	.catch(function(error){
		response.json(error)
	});
});

//Listening
app.listen(PORT, function(){
	console.log("App running at http://localhost:" + PORT);
});