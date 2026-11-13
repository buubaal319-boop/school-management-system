require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('./config/firebase'); // connect to Firebase on startup
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errors');

const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:3000').split(',') }));
app.use(express.json({ limit: '1mb' }));

app.get('/', (req, res) => res.json({ status: 'ok', service: 'school-api' }));
app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`School API running on http://localhost:${PORT}`));
