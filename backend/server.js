const express = require('express')
const app = express();
const db = require('./db');
require('dotenv').config();
const cors = require('cors');

const bodyParser = require('body-parser'); 
app.use(bodyParser.json()); // req.body
const PORT = process.env.PORT || 3000;


app.use(cors({
    origin: 'http://localhost:9000', // Frontend URL (adjust as needed)
    credentials: true                // If you're using cookies/auth headers
  }));


// Import the router files
const userRoutes = require('./routes/userRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
app.use(express.json());
// Use the routers
app.use('/api/users', userRoutes);
app.use('/api/candidates', candidateRoutes);


app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
