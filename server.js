const express = require('express');
const app = express();
require('./db');

require('dotenv').config();

const PORT = process.env.PORT || 3000;
const bodyParser = require('body-parser');
app.use(bodyParser.json());

const {jwtAuthMiddleware, generateToken} = require('./jwt');

const userRoutes = require('./routes/userRoutes');
app.use('/user',userRoutes);

const candidateRoutes = require('./routes/candidateRoutes');
app.use('/candidate', candidateRoutes);



app.listen(PORT, () => {
    console.log('listening on port 3000.');
});
