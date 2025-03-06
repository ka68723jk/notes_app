const express = require('express');
const path = require('path');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const notesRoutes = require('./routes/notes');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());

// Статические файлы (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// Подключаем маршруты профиля
app.use('/api/profile', profileRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});

