import { likedPost, dislikedPost } from '../api.js' // Импортируем функции для работы с API
import { tokenId } from '../index.js' // Импортируем токен пользователя

export const statusLikedPost = () => {
    const likeButtons = document.querySelectorAll('.like-button') // Находим все кнопки лайка

    console.log('Запуск функции отслеживания лайка')

    likeButtons.forEach((button) => {
        button.addEventListener('click', async (e) => {
            const postId = e.currentTarget.getAttribute('data-post-id') // Получаем ID поста
            const img = button.querySelector('img') // Получаем изображение внутри кнопки

            // Проверяем текущее состояние лайка
            const isLiked = img.src.includes('like-active.svg') // Если изображение активного лайка, значит пост лайкнут

            try {
                let result

                button.classList.add('loading')
                button.disable = true

                if (isLiked) {
                    // Если пост лайкнут, снимаем лайк
                    result = await dislikedPost({ tokenId, postId })
                } else {
                    // Если пост не лайкнут, ставим лайк
                    result = await likedPost({ tokenId, postId })
                }
                button.classList.remove('loading')
                button.disable = false
                
                // Обновляем интерфейс
                renderStatusLikedPost(result) // Обновляем состояние
            } catch (error) {
                console.error('Ошибка при обработке лайка/дизлайка поста:', error)
            }
        })
    })
}

export const renderStatusLikedPost = (data) => {
    // Проверяем, что данные корректные
    if (!data || !data.post) {
        console.error('Неверная структура данных для обновления статуса лайка:', data)
        return // Выходим из функции, если данные неверные
    }

    const buttonEl = document.querySelector(`[data-post-id='${data.post.id}']`)

    if (!buttonEl) {
        console.error(`Кнопка лайка с ID ${data.post.id} не найдена`)
        return // Выходим из функции, если кнопка не найдена
    }

    const img = buttonEl.querySelector('img')

    if (img) {
        img.src = data.post.isLiked ? './assets/images/like-active.svg' : './assets/images/like-not-active.svg'
    } else {
        console.error('Изображение внутри кнопки лайка не найдено')
    }

    const likesTextElement = buttonEl.nextElementSibling // Получаем следующий элемент

    if (likesTextElement) {
        const likesText = likesTextElement.querySelector('strong')

        if (likesText) {
            likesText.textContent = data.post.likes.length // Обновляем количество лайков
        } else {
            console.error('Элемент <strong> для количества лайков не найден')
        }
    } else {
        console.error('Элемент для обновления количества лайков не найден')
    }

    console.log(data.post.isLiked) // Для отладки
}
