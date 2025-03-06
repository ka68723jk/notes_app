document.addEventListener('DOMContentLoaded', () => {
    console.log('Скрипт загружен');

    // Функции для работы с localStorage
    const saveAuthData = (userId) => localStorage.setItem('userId', userId);
    const getAuthData = () => localStorage.getItem('userId');
    const clearAuthData = () => localStorage.removeItem('userId');

    // Проверка авторизации
    const checkAuth = () => {
        const userId = getAuthData();
        const currentPath = window.location.pathname;

        if (userId) {
            // Если пользователь авторизован и текущая страница - login.html
            if (currentPath === '/login.html') {
                window.location.href = '/profile.html';
            }
        } else {
            // Если пользователь не авторизован и текущая страница - profile.html
            if (currentPath === '/profile.html') {
                window.location.href = '/login.html';
            }
        }
    };

    // Вызываем checkAuth() только на главной и профильной страницах
    const currentPath = window.location.pathname;
    if (currentPath === '/' || currentPath === '/index.html' || currentPath === '/profile.html') {
        checkAuth();
    }

    // Логотип в шапке
    const siteLogo = document.getElementById('siteLogo');
    if (siteLogo) {
        siteLogo.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Кнопка "Профиль"
    const profileButton = document.getElementById('profileButton');
    if (profileButton) {
        profileButton.addEventListener('click', () => {
            const userId = getAuthData();
            if (userId) {
                window.location.href = '/profile.html';
            } else {
                window.location.href = '/login.html';
            }
        });
    }

    // Кнопка "Выйти"
    const logoutButton = document.querySelector('.btn--logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            clearAuthData();
            alert('Вы успешно вышли.');
            window.location.href = '/login.html'; // Перенаправление на страницу входа
        });
    }

    // Форма входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!username || !password) {
                alert('Введите логин и пароль.');
                return;
            }

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();

                if (response.ok) {
                    saveAuthData(data.userId); // Сохраняем ID пользователя
                    alert(data.message); // Уведомление об успешном входе
                    window.location.href = '/profile.html'; // Перенаправление на страницу профиля
                } else {
                    alert(data.message);
                }
            } catch (error) {
                console.error(error);
                alert('Ошибка при входе.');
            }
        });
    }

    // Форма регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const email = document.getElementById('email').value.trim();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !email.includes('@')) {
                alert('Введите корректный email.');
                return;
            }

            if (!username) {
                alert('Введите логин.');
                return;
            }

            if (!password || password.length < 6) {
                alert('Пароль должен содержать минимум 6 символов.');
                return;
            }

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, username, password }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Ошибка сервера:', errorData);
                    alert(errorData.message || 'Ошибка при регистрации.');
                    return;
                }

                const data = await response.json();
                alert(data.message);
                saveAuthData(data.userId); // Сохраняем ID пользователя
                window.location.href = '/profile.html'; // Перенаправление на страницу профиля
            } catch (error) {
                console.error('Ошибка сети:', error);
                alert('Ошибка при регистрации.');
            }
        });
    }

    // Получение ID пользователя из localStorage
    const userId = getAuthData();
    if (!userId && currentPath === '/profile.html') {
        window.location.href = '/login.html';
        return;
    }

    // Глобальная переменная для хранения заметок
    let notes = [];
    
    // Элементы интерфейса
    const createNoteButton = document.getElementById('createNoteButton');
    const deleteNoteButton = document.getElementById('deleteNoteButton');
    const notesDisplay = document.getElementById('notesDisplay');
    const noteFormContainer = document.getElementById('noteFormContainer');
    const noteForm = document.getElementById('noteForm');
    const cancelNoteButton = document.getElementById('cancelNoteButton');

    // Открытие формы создания заметки
    if (createNoteButton && noteFormContainer) {
        createNoteButton.addEventListener('click', () => {
            noteFormContainer.classList.remove('hidden');
        });
    }

    // Закрытие формы создания заметки
    if (cancelNoteButton && noteFormContainer) {
        cancelNoteButton.addEventListener('click', () => {
            noteFormContainer.classList.add('hidden');
        });
    }

    // Сохранение заметки
    if (noteForm) {
        noteForm.addEventListener('submit', async (event) => {
            event.preventDefault();

            const title = document.getElementById('noteTitle').value.trim();
            const content = document.getElementById('noteContent').value.trim();

            if (!title || !content) {
                alert('Введите заголовок и текст заметки.');
                return;
            }

            try {
                const response = await fetch('/api/notes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, title, content }),
                });

                if (response.ok) {
                    const data = await response.json();
                    notes.push(data.note); // Добавляем заметку в массив
                    renderNotes();
                    noteForm.reset();
                    noteFormContainer.classList.add('hidden');
                    alert('Заметка успешно сохранена!');
                } else {
                    const errorData = await response.json();
                    alert(errorData.message || 'Ошибка при сохранении заметки.');
                }
            } catch (error) {
                console.error(error);
                alert('Ошибка при сохранении заметки.');
            }
        });
    }

    // Отображение заметок
    function renderNotes() {
        if (!notesDisplay) return;

        notesDisplay.innerHTML = '';

        notes.forEach((note) => {
            const noteCard = document.createElement('div');
            noteCard.classList.add('note-card');
            noteCard.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.content}</p>
            `;
            notesDisplay.appendChild(noteCard);
        });
    }

    // Загрузка заметок пользователя
    const loadNotes = async () => {
        try {
            const response = await fetch(`/api/notes?userId=${userId}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                const data = await response.json();
                notes = data.notes;
                renderNotes();
            } else {
                const errorData = await response.json();
                alert(errorData.message || 'Ошибка при загрузке заметок.');
            }
        } catch (error) {
            console.error(error);
            alert('Ошибка при загрузке заметок.');
        }
    };

    if (userId) {
        loadNotes();
    }
    // Показать модальное окно
    deleteNoteButton.addEventListener('click', () => {
        deleteModal.classList.remove('hidden'); // Показываем модальное окно
    });

    // Скрыть модальное окно
    cancelDeleteButton.addEventListener('click', () => {
        deleteModal.classList.add('hidden'); // Скрываем модальное окно
        deleteNoteTitle.value = ''; // Очищаем поле ввода
    });
});

// Удаление заметки
confirmDeleteButton.addEventListener('click', async () => {
    const titleToDelete = deleteNoteTitle.value.trim();

    if (!titleToDelete) {
        alert('Введите заголовок заметки.');
        return;
    }

    const noteToDelete = notes.find((note) => note.title === titleToDelete);

    if (!noteToDelete) {
        alert('Заметка с таким заголовком не найдена.');
        return;
    }

    try {
        const response = await fetch(`/api/notes/${noteToDelete.id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message || 'Заметка успешно удалена.');

            // Удаляем заметку из массива и перерисовываем интерфейс
            notes = notes.filter((note) => note.id !== noteToDelete.id);
            renderNotes();

            // Скрываем модальное окно
            deleteModal.classList.add('hidden');
            deleteNoteTitle.value = ''; // Очищаем поле ввода
        } else {
            const errorData = await response.json();
            alert(errorData.message || 'Ошибка при удалении заметки.');
        }
    } catch (error) {
        console.error(error);
        alert('Ошибка при удалении заметки.');
    }
});