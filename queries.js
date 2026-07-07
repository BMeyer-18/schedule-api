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

// SCHEDULES
// GET: /api/v1/schedules | readAllResponses()
const readAllResponses = async (request, response) => {
    try {
        const results = await pool.query(
            'SELECT * FROM schedules ORDER BY id ASC'
        )
        response.status(200).json(results.rows);
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// GET: /api/v1/schedules/:event | readEventResponses()
const readEventResponses = async (request, response) => {
    const event = request.params.event.toLowerCase();
    try {
        const results = await pool.query(
            'SELECT * FROM schedules WHERE event = $1 ORDER BY id ASC',
            [event]
        );
        response.status(200).json(results.rows);
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// GET: /api/v1/schedules/:event/:name | readUserResponse()
const readUserResponse = async (request, response) => {
    const event = request.params.event.toLowerCase();
    const name = request.params.name.toLowerCase();
    try {
        const results = await pool.query(
            'SELECT * FROM schedules WHERE event = $1 AND name = $2',
            [event, name]
        );
        response.status(200).json(results.rows);
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// POST: /api/v1/schedules/:event | createUserResponse()
const createUserResponse = async (request, response) => {
    const event = request.params.event.toLowerCase();
    const name = request.body.name.toLowerCase();
    const availability = request.body.availability;

    if (availability.length !== 336) {
        response.status(400).json({ info: "Availability of incorrect length. Should be for 336 time slots (7 days * 48 half-hour increments)." });
        return;
    }

    if ((await pool.query('SELECT * FROM passwords WHERE event = $1', [event])).rows.length === 0) {
        response.status(400).json({ info: `event ${event} does not exist` });
        return;
    }

    try {
        const results = await pool.query(
            'INSERT INTO schedules (name, event, availability) VALUES ($1, $2, $3) RETURNING *',
            [name, event, availability]
        );
        response.status(201).json({ info: `User ${results.rows[0].name} added to event ${results.rows[0].event}` });
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// PATCH: /api/v1/schedules/:event | updateUserResponse()
const updateUserResponse = async (request, response) => {
    const event = request.params.event.toLowerCase();
    const name = request.body.name.toLowerCase();

    if((await pool.query('SELECT * FROM schedules WHERE name = $1 AND event = $2', [name, event])).rows.length === 0) {
        response.status(404).json({ info: `user ${name} at event ${event} not found` });
        return;
    }

    if (availability.length !== 336) {
        response.status(400).json({ info: "Availability of incorrect length. Should be for 336 time slots (7 days * 48 half-hour increments)." });
        return;
    }

    const availability = request.body.availability;
    try {
        const results = await pool.query(
            'UPDATE schedules SET availability = $1 WHERE name = $2 AND event = $3 RETURNING *',
            [availability, name, event]
        );
        response.status(200).json({ info: `Updated user ${results.rows[0].name} for event ${results.rows[0].event}` });
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// PUT: /api/v1/schedules/:event | updateOrCreateUserResponse()
const updateOrCreateUserResponse = async (request, response) => {
    const event = request.params.event.toLowerCase();
    const name = request.body.name.toLowerCase();

    if((await pool.query('SELECT * FROM schedules WHERE name = $1 AND event = $2', [name, event])).rows.length === 0) {
        createUserResponse(request, response);
        return;
    }

    const availability = request.body.availability;
    if (availability.length !== 336) {
        response.status(400).json({ info: "Availability of incorrect length. Should be for 336 time slots (7 days * 48 half-hour increments)." });
        return;
    }

    try {
        const results = await pool.query(
            'UPDATE schedules SET availability = $1 WHERE name = $2 AND event = $3 RETURNING *',
            [availability, name, event]
        );
        response.status(200).json({ info: `Updated user ${results.rows[0].name} for event ${results.rows[0].event}` });
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// DELETE: /api/v1/schedules/:event | deleteEventResponses()
const deleteEventResponses = async (request, response) => {
    const event = request.params.event.toLowerCase();
    try {
        await pool.query(
            'DELETE FROM schedules WHERE event = $1',
            [event]
        );
        response.status(200).json({ info: `Deleted all users from event ${event}` });
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// DELETE: /api/v1/schedules/:event/:name | deleteUserResponse()
const deleteUserResponse = async (request, response) => {
    const event = request.params.event.toLowerCase();
    const name = request.params.name.toLowerCase();
    try {
        await pool.query(
            'DELETE FROM schedules WHERE event = $1 AND name = $2',
            [event, name]
        );
        response.status(200).json({ info: `Deleted user ${name} from event ${event}` });
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// PASSWORDS
// GET: /api/v1/passwords | readAllPasswords()
const readAllPasswords = async (request, response) => {
    if (request.headers['admin-password'] !== process.env.DB_ADMINPASS) {
        response.status(401).json({ info: "Access denied" });
    }

    try {
        const results = await pool.query(
            'SELECT * FROM passwords'
        )
        response.status(200).json(results.rows);
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// GET: /api/v1/passwords/:event | readEventPassword()
const readEventPassword = async (request, response) => {
    if (request.headers['admin-password'] !== process.env.DB_ADMINPASS) {
        response.status(401).json({ info: "Access denied" });
    }

    const event = request.params.event.toLowerCase();
    try {
        const results = await pool.query(
            'SELECT * FROM passwords WHERE event = $1',
            [event]
        );
        response.status(200).json(results.rows);
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// POST: /api/v1/passwords/:event | createEventPassword()
const createEventPassword = async (request, response) => {
    const event = request.params.event.toLowerCase();
    if (event.length === 0) {
        response.status(400).json({ info: "Event name must be included in URL" });
        return;
    }
    if((await pool.query('SELECT * FROM passwords WHERE event = $1', [event])).rows.length > 0) {
        response.status(400).json({ info: `Event with name ${event} already exists` });
        return;
    }

    const password = request.body.password;
    if (password.length === 0) {
        response.status(400).json({ info: "Password must be included in body" });
        return;
    }

    try {
        const results = await pool.query(
            'INSERT INTO passwords (event, password) VALUES ($1, $2) RETURNING *',
            [event, password]
        );
        response.status(201).json({ info: `Event ${results.rows[0].event} added with your password` });
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// PATCH & PUT: /api/v1/passwords/:event | updateEventPassword()
const updateEventPassword = async (request, response) => {
    const event = request.params.event.toLowerCase();
    if (event.length === 0) {
        response.status(400).json({ info: "Event name must be included in URL" });
        return;
    }
    if((await pool.query('SELECT * FROM passwords WHERE event = $1', [event])).rows.length === 0) {
        response.status(404).json({ info: `Event ${event} not found` });
        return;
    }

    const oldPassword = request.body.oldPassword;
    const newPassword = request.body.newPassword;
    if (oldPassword.length === 0 || newPassword.length === 0) {
        response.status(400).json({ info: "Old and new passwords must be included in body" });
        return;
    }
    if (oldPassword === newPassword) {
        response.status(400).json({ info: "New password cannot be the same as old password" });
        return;
    }

    const getResponse = await pool.query('SELECT * FROM passwords WHERE event = $1', [event]);
    if (getResponse.rows.length === 0) {
        response.status(404).json({ info: `Event ${event} not found` });
        return;
    }
    if (getResponse.rows[0].password !== oldPassword) {
        response.status(401).json({ info: "Incorrect old password" });
        return;
    }

    try {
        const results = await pool.query(
            'UPDATE passwords SET password = $1 WHERE event = $2 RETURNING *',
            [newPassword, event]
        );
        response.status(200).json({ info: `Event ${results.rows[0].event} added with your password` });
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// DELETE: /api/v1/passwords/:event | deleteEventPassword()
const deleteEventPassword = async (request, response) => {
    const event = request.params.event.toLowerCase();
    if (event.length === 0) {
        response.status(400).json({ info: "Event name must be included in URL" });
        return;
    }

    const getResponse = await pool.query('SELECT * FROM passwords WHERE event = $1', [event]);
    if (getResponse.rows.length === 0) {
        response.status(404).json({ info: `Event ${event} not found` });
        return;
    }
    const password = request.body.password;
    if (getResponse.rows[0].password !== password) {
        response.status(401).json({ info: "Incorrect password" });
        return;
    }

    try {
        await pool.query('DELETE FROM passwords WHERE event = $1 AND password = $2', [event, password]);
        response.status(200).json({ info: `Deleted event` })
    } catch (error) {
        response.status(500).json({ info: `Internal server error: ${error}` });
    }
};

// EXPORTS
export {
    readMetaInfo,
    readAllResponses,
    readEventResponses,
    readUserResponse,
    createUserResponse,
    updateUserResponse,
    updateOrCreateUserResponse,
    deleteEventResponses,
    deleteUserResponse,

    readAllPasswords,
    readEventPassword,
    createEventPassword,
    updateEventPassword,
    deleteEventPassword,
};