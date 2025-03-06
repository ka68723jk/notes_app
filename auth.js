const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();
// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Проверка полей
        if (!email || !email.includes('@')) {
            return res.status(400).json({ message: 'Введите корректный email.' });
        }
        if (!username) {
            return res.status(400).json({ message: 'Введите логин.' });
        }
        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Пароль должен содержать минимум 6 символов.' });
        }

        // Создание пользователя
        const user = await User.create(email, username, password);

        res.status(201).json({ message: 'Успешная регистрация!', userId: user.id });
    } catch (error) {
        console.error('Ошибка при регистрации:', error.message);
        if (error.message === 'Пользователь с таким email или логином уже существует.') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
});

// Вход
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Поиск пользователя
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(400).json({ message: 'Неверный логин или пароль.' });
        }

        // Проверка пароля
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Неверный логин или пароль.' });
        }

        res.status(200).json({ message: 'Успешный вход!', userId: user.id });
    } catch (error) {
        console.error('Ошибка при входе:', error.message);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
});

module.exports = router; // Экспорт маршрутов