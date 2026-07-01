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


// GET: / | displayHome()


// GET: /users | getUsers()
const getUsers = async (request, response) => {
    try {
        const results = await pool.query('SELECT * FROM schedules ORDER BY id ASC');
        response.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

// GET: /users/:id | getUserById()
const getUserById = async (request, response) => {
    const id = parseInt(request.params.id, 10);
    try {
        const results = await pool.query('SELECT * FROM schedules WHERE id = $1', [id]);
        response.status(200).json(results.rows);
    } catch (error) {
        throw error;
    }
};

// POST: /users | createUser()
const createUser = async (request, response) => {
    const { name, event, availability } = request.body;
    try {
        const results = await pool.query(
            'INSERT INTO schedules (name, event, availability) VALUES ($1, $2, $3) RETURNING *',
            [name, event, availability]
        );
        response.status(201).send(`User added with ID ${results.rows[0].id}`)
    } catch (error) {
        throw error;
    }
};

// PUT: /users/:id | updateUser()
const updateUser = async (request, response) => {
    const id = parseInt(request.params.id, 10);
    const { name, event, availability } = request.body;
    try {
        await pool.query('UPDATE schedules SET name = $1, event = $2, availability = $3 WHERE id = $4',
            [name, event, availability, id]);
        response.status(200).send(`User modified with ID: ${id}`);
    } catch (error) {
        throw error;
    }
};

// DELETE: /users/:id | deleteUser()
const deleteUser = async (request, response) => {
    const id = parseInt(request.params.id, 10);
    try {
        await pool.query('DELETE FROM schedules WHERE id = $1', [id]);
        response.status(200).send(`User deleted with ID: ${id}`);
    } catch (error) {
        throw error;
    }
};


export {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
};