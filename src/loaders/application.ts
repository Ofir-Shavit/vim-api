import express from 'express';
import bodyParser from 'body-parser';
import logger from 'morgan';
import router from '../api/routes';

const app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(logger('dev'));

// Routing endpoints
app.use(router);

export default app;
