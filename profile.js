const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Маршрут для получения данных профиля по userId
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;

        // Проверка существования пользователя
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден.' });
        }

        res.status(200).json({ message: 'Доступ к профилю разрешен.', user });
    } catch (error) {
        console.error('Ошибка при загрузке данных профиля:', error.message);
        res.status(500).json({ message: 'Ошибка сервера. Попробуйте позже.' });
    }
});

module.exports = router; // Экспорт маршрутов