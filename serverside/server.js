const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 5000;

// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const electionRoutes = require("./routes/election");

// Use the routers
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);
app.use("/api/elections", electionRoutes);


app.listen(PORT, ()=>{
    console.log('listening on port 3000');
})