import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import * as db from './queries.js'

const app = express();
const port = 3000;
const apiLimiter = rateLimit({
    windowMs: 10 * 60000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false
});

app.use(express.json());
app.use(cors());
app.use(
    express.urlencoded({
        extended: true
    })
);
app.use('/api/v1/schedules', apiLimiter);

app.get('/', db.readMetaInfo);
app.get('/api', db.readMetaInfo);
app.get('/api/v1', db.readMetaInfo);

app.get('/api/v1/schedules', db.readAllResponses);
app.get('/api/v1/schedules/:event', db.readEventResponses);
app.get('/api/v1/schedules/:event/:name', db.readUserResponse);
app.post('/api/v1/schedules/:event', db.createUserResponse);
app.patch('/api/v1/schedules/:event', db.updateUserResponse);
app.put('/api/v1/schedules/:event', db.updateOrCreateUserResponse);
app.delete('/api/v1/schedules/:event', db.deleteEventResponses);
app.delete('/api/v1/schedules/:event/:name', db.deleteUserResponse);

app.get('/api/v1/passwords', db.readAllPasswords);
app.get('/api/v1/passwords/:event', db.readEventPassword);
app.post('/api/v1/passwords/:event', db.createEventPassword);
app.patch('/api/v1/passwords/:event', db.updateEventPassword);
app.put('/api/v1/passwords/:event', db.updateEventPassword);
app.delete('/api/v1/passwords/:event', db.deleteEventPassword);

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});