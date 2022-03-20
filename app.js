const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const redis = require('redis');
require('./database/connection');

/** routes imports */
const userRoutes = require('./routes/user');
const tableRoutes = require('./routes/table');
const reservationRoutes = require('./routes/reservation');

/** redis connection */
const redisClient = redis.createClient({
    socket: {
        host: "redis",
        port: 6379
      }
});
redisClient.connect();
redisClient.on('connect', function() {
    console.log(
        '\x1b[31m', '***',
        '\x1b[0m', '   The redis server is connected  ',
        '\x1b[31m', '***\n',
        '\x1b[0m',
    );
  });

redisClient.on('error', function(error) {
    console.log(error);
  });

/** configs */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use((req, res, next) => {
    req.redisClient = redisClient;
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
            "Access-Control-Allow-Headers", 
            "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    res.setHeader(
        "Access-Control-Allow-Methods", 
        "GET, POST, PATCH, PUT, DELETE, OPTIONS"
    );
    next();
});


/** all APIs acess routes */
app.use("/api-user", userRoutes);
app.use("/api-table", tableRoutes);
app.use("/api-reservation", reservationRoutes);


/** return 404 for any wrong route */
app.use("", function(req, res) {
    console.log(req.path)
    res.status(404).json("Not Found")
});

module.exports = app;
