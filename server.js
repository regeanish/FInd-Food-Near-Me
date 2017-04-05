"use strict";

var express = require("express"),
    bodyParser = require("body-parser"),
    http = require("http"),
    Yelp = require("yelp"),
    mongoose = require("mongoose"),
    app = express(),
    configAuth = require('./config');

var yelp = new Yelp(configAuth.yelp);

app.use(express.static("."));
app.use(bodyParser.json({ type: 'application/*+json' }));
app.use(bodyParser.urlencoded({ extended: false }));


//////// MONGODB CONNECTION //////////////
mongoose.connect("mongodb://admin:admin@ds015942.mlab.com:15942/foodnearme", function(error, success){
    if(error){
        console.log("Error connecting to database: \n" + error);
    }
    else{
        console.log('Connected to Database');
    }
});

var reviewSchema = mongoose.Schema({
    restaurant: String,
    rating: Number,
    written: String,
    restaurantID: String,
    date: String
});

var reviews = mongoose.model("reviews", reviewSchema);


////////// ROUTES ///////////////
app.get('/', function(req,res){
   res.sendFile(__dirname+"/index.html"); 
});

app.get('/find', function(req,res) {
    console.log("Latitude = " + req.query.latitude);
    console.log("Longitude = " + req.query.longitude);
    
    var swLat = parseFloat(req.query.latitude) - 0.0075;
    var swLong = parseFloat(req.query.longitude) - 0.0075;
    var neLat = parseFloat(req.query.latitude) + 0.0075;
    var neLong = parseFloat(req.query.longitude) + 0.0075;
    
    yelp.search({
        term: "food",
        bounds: swLat + "," + swLong + "|" + neLat + "," + neLong
    })
    .then(function(data) {
        res.json(data);
    })
    .catch(function(err) {
        console.log(err); 
    });
});

app.post('/review', function(req,res) {
    var tempReview = new reviews({
        restaurant: req.body.restaurant,
        rating: req.body.rating,
        written: req.body.written,
        restaurantID: req.body.restaurantID,
        date: req.body.date
    });
    console.log(tempReview);
    
    tempReview.save(function(err, tempReview) {
        if (err) {
            return console.log(err);
        }
        console.log("Review Successfully Saved!");
        res.json(tempReview);
    });
});

app.get('/review', function(req,res) {
    reviews.find({ restaurant: req.query.restaurant }, function (err, obj) {
        if(err) {
            return console.log(err);
        }
        res.json(obj);
    });
});

//////// SERVER CONNECTION ///////////
http.createServer(app).listen(3000, function(){
    console.log('Server listening on port 3000');
});
