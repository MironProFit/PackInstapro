export const initializeThemeToggle = () => {
    try {
        const themeToggle = document.getElementById('theme-toggle');
        const postImageContainers = document.querySelectorAll('.post-image-container'); // Получаем все контейнеры изображений
        const sunIcon = document.querySelector('.sun-icon'); // Получаем иконку солнца
        const moonIcon = document.querySelector('.moon-icon'); // Получаем иконку луны

        // Проверяем наличие элемента themeToggle
        if (!themeToggle) {
            console.error('Не найден элемент #theme-toggle');
            return; // Выходим из функции, если элемент не найден
        }

        // Проверяем сохраненный режим в localStorage
        if (localStorage.getItem('theme') === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true; // Устанавливаем переключатель в положение 'включено'

            // Применяем темный режим ко всем контейнерам
            postImageContainers.forEach(container => {
                container.classList.add('dark-mode');
            });

            // Скрываем солнце и показываем луну
            sunIcon.style.opacity = 0; // Скрываем иконку солнца
            moonIcon.style.opacity = 1; // Показываем иконку луны
        } else {
            document.body.classList.add('light-mode');

            // Применяем светлый режим ко всем контейнерам
            postImageContainers.forEach(container => {
                container.classList.add('light-mode');
            });

            // Показываем солнце и скрываем луну
            sunIcon.style.opacity = 1; // Показываем иконку солнца
            moonIcon.style.opacity = 0; // Скрываем иконку луны
        }

        // Обработчик события для переключателя
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                // Если переключатель включен, устанавливаем темный режим
                document.body.classList.remove('light-mode');
                document.body.classList.add('dark-mode');

                // Применяем темный режим ко всем контейнерам
                postImageContainers.forEach(container => {
                    container.classList.remove('light-mode');
                    container.classList.add('dark-mode');
                });

                // Скрываем солнце и показываем луну
                sunIcon.style.opacity = 0; // Скрываем иконку солнца
                moonIcon.style.opacity = 1; // Показываем иконку луны
                localStorage.setItem('theme', 'dark'); // Сохраняем выбранный режим
            } else {
                // Если переключатель выключен, устанавливаем светлый режим
                document.body.classList.remove('dark-mode');
                document.body.classList.add('light-mode');

                // Применяем светлый режим ко всем контейнерам
                postImageContainers.forEach(container => {
                    container.classList.remove('dark-mode');
                    container.classList.add('light-mode');
                });

                // Показываем солнце и скрываем луну
                sunIcon.style.opacity = 1; // Показываем иконку солнца
                moonIcon.style.opacity = 0; // Скрываем иконку луны
                localStorage.setItem('theme', 'light'); // Сохраняем выбранный режим
            }
        });
    } catch (error) {
        console.error('Произошла ошибка:', error);
    }
};