const express = require('express');
const router = express.Router();
const pool = require('../db'); // Подключение к базе данных

// Получение всех заметок пользователя
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            console.error('Ошибка: userId не передан.');
            return res.status(400).json({ message: 'Необходимо указать ID пользователя.' });
        }

        console.log('Загрузка заметок для userId:', userId);

        const query = 'SELECT * FROM notes WHERE user_id = $1 ORDER BY created_at DESC';
        const result = await pool.query(query, [userId]);

        console.log('Результат запроса:', result.rows);
        res.status(200).json({ notes: result.rows });
    } catch (error) {
        console.error('Ошибка сервера:', error.message);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
});

// Создание новой заметки
router.post('/', async (req, res) => {
    try {
        const { userId, title, content } = req.body;

        if (!userId || !title || !content) {
            return res.status(400).json({ message: 'Необходимо указать userId, title и content.' });
        }

        const query = 'INSERT INTO notes (user_id, title, content) VALUES ($1, $2, $3) RETURNING *';
        const result = await pool.query(query, [userId, title, content]);

        res.status(201).json({ note: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при создании заметки:', error.message);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
});
// Удаление заметки
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const query = 'DELETE FROM notes WHERE id = $1 RETURNING *';
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Заметка не найдена.' });
        }

        res.status(200).json({ message: 'Заметка успешно удалена.', note: result.rows[0] });
    } catch (error) {
        console.error('Ошибка при удалении заметки:', error.message);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
});

module.exports = router;