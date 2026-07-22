const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000
const mongoDB = require('./db');
require('dotenv').config();
const passport = require("passport");
require("./config/passport");

mongoDB();

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./Routes/CreateUser'));
app.use('/api', require('./Routes/DisplayServices'));
app.use('/api', require('./Routes/Checkout'));
app.use('/api', require('./Routes/OrderData'));
app.use('/api', require('./Routes/Contact'));
app.use(
  require("express-session")({
    secret: "secret",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
  