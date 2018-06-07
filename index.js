//NPM Packages
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
var apiRoutes = express.Router();

//Custom Files
const Config = require("./Config");
const User = require("./models/User");

//Port Number
const PORT = 5000;

//Connect MongoDB with secret key
mongoose.connect(Config.database);
app.set("superSecret", Config.secret);


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(morgan('dev'));


//Route for creating a user
app.get("/setup", function (req, res) {
    var newUser = new User({
        name: "Huzaifa",
        password: "12345",
        admin: true
    });
    newUser.save(function (error) {
        if (error) {
            console.log("Error: ", error)
        }

        console.log('User saved successfully');
        res.json({ success: true });
    })
});


app.get("/", function (req, res) {
    res.send("Hello API is at: " + PORT + "/api");
    res.end();
});




//Route for Authentticate
apiRoutes.post("/authenticate", function (req, res) {
    User.findOne({
        // $or: [
            // {
                name: req.body.name,
                // password: req.body.password
            // }
        // ]
    }, function (err, user) {
        if (err) {
            console.log("Error: ", err)
        }
        if (!user) {
            res.json({ success: false, message: 'Authentication failed. User not found.' });
        }
        else if (user) {
            //check for matching password
            if (user.password != req.body.password) {
                res.json({ success: false, message: 'Authentication failed. Wrong Password' });
            }
            else {
                const payload = {
                    admin: User.admin
                };
                var token = jwt.sign(payload, app.get("superSecret"));
                res.json({
                    success: true,
                    message: "Enjoy your token",
                    token: token
                })
            }
        }
    })
});


//Route for Checking TOKEN
apiRoutes.use(function (req, res, next) {
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    if (token) {
        jwt.verify(token, app.get("superSecret"), function (err, decoded) {
            if (err) {
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            }
            else {
                req.decoded = decoded;
                next();
            }
        })
    }
    else {
        return res.status(403).send({
            success: false,
            message: "The Route is protected and Required a Token"
        })
    }
});


//Route to Main Page
apiRoutes.get("/", function (req, res) {
    res.json({
        message: "Welcome to API"
    });
});

//Route to get Users
apiRoutes.get("/:id", function (req, res) {
    User.findOne({_id:req.params.id}, function (err, Users) {
        res.json(Users)
    })
});



app.use("/api", apiRoutes)


app.listen(PORT, function () {
    console.log("Server is listening on:, ", PORT)
});


