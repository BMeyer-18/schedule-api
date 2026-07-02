import pg from 'pg';
import 'dotenv/config';

const { Pool } = pg;
const pool = new Pool ({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
});

// GET: / & /api & /api/v1 | readMetaInfo()
const readMetaInfo = async (request, response) => {
    response.json({ info: 'REST API for scheduling site using Node.js, Express, and Postgres' });
};

//GET: /api/v1/schedules | readAllResponses()
const readAllResponses = async (request, response) => {
    try {
        const results = await pool.query(
            'SELECT * FROM schedules ORDER BY id ASC'
        )
        response.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

// GET: /api/v1/schedules/:event | readEventResponses()
const readEventResponses = async (request, response) => {
    const event = request.params.event;
    try {
        const results = await pool.query(
            'SELECT * FROM schedules WHERE event = $1 ORDER BY id ASC',
            [event]
        );
        response.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

// GET: /api/v1/schedules/:event/:name | readUserResponse()
const readUserResponse = async (request, response) => {
    const event = request.params.event;
    const name = request.params.name;
    try {
        const results = await pool.query(
            'SELECT * FROM schedules WHERE event = $1 AND name = $2',
            [event, name]
        );
        response.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

// POST: /api/v1/schedules/:event | createUserResponse()
const createUserResponse = async (request, response) => {
    const event = request.params.event;
    const { name, availability } = request.body;
    try {
        const results = await pool.query(
            'INSERT INTO schedules (name, event, availability) VALUES ($1, $2, $3) RETURNING *',
            [name, event, availability]
        );
        response.status(201).json({ info: `User ${results.rows[0].name} added to event ${results.rows[0].event}` });
    } catch (error) {
        throw error;
    }
};

// PUT: /api/v1/schedules/:event | updateUserResponse()
const updateUserResponse = async (request, response) => {
    const event = request.params.event;
    const { name, availability } = request.body;
    try {
        const results = await pool.query(
            'UPDATE schedules SET availability = $1 WHERE name = $2 AND event = $3',
            [availability, name, event]
        );
        response.status(200).json({ info: `Updated user ${results.rows[0].name} for event ${results.rows[0].event}` });
    } catch (error) {
        throw error;
    }
};

// DELETE: /api/v1/schedules/:event | deleteEventResponses()
const deleteEventResponses = async (request, response) => {
    const event = request.params.event;
    try {
        await pool.query(
            'DELETE FROM schedules WHERE event = $1',
            [event]
        );
        response.status(200).json({ info: `Deleted all users from event ${event}` });
    } catch (error) {
        throw error;
    }
};

// DELETE: /api/v1/schedules/:event/:name | deleteUserResponse()
const deleteUserResponse = async (request, response) => {
    const event = request.params.event;
    const name = request.params.name;
    try {
        await pool.query(
            'DELETE FROM schedules WHERE event = $1 AND name = $2',
            [event, name]
        );
        response.status(200).json({ info: `Deleted user ${user} from event ${event}` });
    } catch (error) {
        throw error;
    }
};


export {
    readMetaInfo,
    readAllResponses,
    readEventResponses,
    readUserResponse,
    createUserResponse,
    updateUserResponse,
    deleteEventResponses,
    deleteUserResponse
};