import express from 'express';
import cors from 'cors';
import * as db from './queries.js'

const app = express();
const port = 3000;

app.use(express.json());
app.use(cors());
app.use(
    express.urlencoded({
        extended: true
    })
);

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

app.listen(port, () => {
    console.log(`App running on port ${port}.`)
});