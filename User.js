const pool = require('../db');
const bcrypt = require('bcryptjs');

class User {
    static async create(email, username, password) {
        // Проверка, существует ли пользователь с таким email или username
        const existingUser = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (existingUser.rows.length > 0) {
            throw new Error('Пользователь с таким email или логином уже существует.');
        }

        // Хеширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание пользователя
        const query = 'INSERT INTO users (email, username, password) VALUES ($1, $2, $3) RETURNING *';
        const values = [email, username, hashedPassword];
        const result = await pool.query(query, values);
        return result.rows[0];
    }

    static async findByUsername(username) {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await pool.query(query, [username]);
        return result.rows[0];
    }
    
    static async findById(id) {
        const query = 'SELECT * FROM users WHERE id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
}

module.exports = User;